"""Import *synthetic* FakePlant directory and world memberships, safely and idempotently.

Does not enable authentication or implement Kristal live sync/detach.
Only registered inside Konnaxion host, not the separate Konnaxion_Worlds engine.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from collections import defaultdict
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from konnaxion.worlds.models import Universe, UniverseMembership, World, WorldMembership, WorldPersonaBridge


def _validate_release_local_collision(user, person, bridges, universe_id, allowed_world_keys, username_max_length):
    """Allow ONLY an existing non-login bridge of a FakePlant World release.

    A release-local bridge is a separate technical User; it must NOT be renamed,
    merged with the canonical account, or stripped of its email. An email match
    alone is never sufficient to identify the same principal.
    """
    if not (user.is_klone and user.account_type == 'human'
                and not user.is_staff and not user.is_superuser
                and not user.can_interactive_login
                and not user.has_usable_password()):
        return 'existing account is not a protected non-login synthetic persona'
    if user.email != person['email']:
        return 'email does not match the fixture identity exactly'
    if len(bridges) != 1:
        return f'expected one release bridge, found {len(bridges)}'
    bridge = bridges[0]
    world = bridge.persona.world
    release = bridge.release
    if (world.universe_id != universe_id or world.key not in allowed_world_keys
            or bridge.persona.world_id != world.pk or release.world_id != world.pk):
        return 'bridge belongs outside FakePlant or has an inconsistent World/release'
    requested = (bridge.metadata_json or {}).get('requested_username')
    if requested and requested != person['username']:
        return 'bridge metadata points to another persona username'

    # Must match the exact algorithm in Konnaxion_Worlds/services/personas.py.
    prefix = f'w{world.pk}r{release.pk}__'
    digest = hashlib.sha256(
        f"{bridge.persona.source_key}\0{person['username']}".encode('utf-8')
    ).hexdigest()[:10]
    suffix = f'__{digest}'
    room = max(1, username_max_length - len(prefix) - len(suffix))
    expected_username = f"{prefix}{person['username'][:room]}{suffix}"
    if user.username != expected_username:
        return 'username is not the deterministic World/release bridge username'
    return None


def _scan_email_collisions(User, people, usernames, universe, allowed_world_keys):
    """Inspect existing emails; no queries write anything. Fail closed."""
    by_email = {p['email']: p for p in people}
    collisions = list(User.objects.filter(email__in=by_email).exclude(username__in=usernames))
    if not collisions:
        return 0, []
    bridges_by_user = defaultdict(list)
    bridge_rows = (WorldPersonaBridge.objects
                   .filter(bridge_user_id__in=[u.pk for u in collisions])
                   .select_related('persona__world', 'release'))
    for bridge in bridge_rows:
        bridges_by_user[bridge.bridge_user_id].append(bridge)
    max_length = int(User._meta.get_field('username').max_length or 150)
    refused = []
    allowed = 0
    for user in collisions:
        person = by_email.get(user.email)
        if universe is None or person is None:
            reason = 'Universe absent or email absent from canonical fixture'
        else:
            reason = _validate_release_local_collision(
                user, person, bridges_by_user.get(user.pk, []),
                universe.pk, allowed_world_keys, max_length
            )
        if reason is None:
            allowed += 1
        else:
            refused.append((user.username, reason))
    return allowed, refused


class Command(BaseCommand):
    help = "FakePlant: preview or provision 900 synthetic, non-login Konnaxion identities"

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Write; default is read-only preview')
        parser.add_argument('--confirm-fakeplant', action='store_true', help='Required with --apply')

    def handle(self, *args, **options):
        root = Path(settings.BASE_DIR).parent.parent / 'Konnaxion_Worlds' / 'universes' / 'fakeplant' / 'fixture'
        if not root.is_dir():
            raise CommandError('Fixture canonique introuvable : Konnaxion_Worlds/universes/fakeplant/fixture')
        try:
            manifest = json.loads((root / 'MANIFEST.json').read_text(encoding='utf-8'))
            data = {}
            for filename, checksum in manifest['sha256'].items():
                raw = (root / filename).read_bytes()
                if hashlib.sha256(raw).hexdigest() != checksum:
                    raise ValueError(f'Integrity mismatch: {filename}')
                data[filename] = json.loads(raw)
            org = data['organigramme.json']['organization']
            people = data['employes.json']['employees']
            memberships = data['acces-worlds.json']['memberships']
            if org['slug'] != 'fakeplant' or org['schema_version'] != 'koa.organization-state/1.0':
                raise ValueError('Wrong organization or contract')
            if len(people) != 900 or len(org['worlds']) != 6 or len(memberships) != 2736:
                raise ValueError('Unexpected person/world/membership counts')
            people_by_id = {p['id']: p for p in people}
            if len(people_by_id) != len(people):
                raise ValueError('Duplicate person IDs')
            if len({p['username'] for p in people}) != len(people) or len({p['email'] for p in people}) != len(people):
                raise ValueError('Duplicate usernames/emails')
            for p in people:
                if not (p['synthetic'] is True and p['login_enabled'] is False
                        and p['username'].startswith('demo_fp_')
                        and p['email'].endswith('@fakeplant.example.test')
                        and p['security']['no_password'] is True):
                    raise ValueError(f'Unsafe synthetic identity: {p.get("id")}')
            keys = {w['key'] for w in org['worlds']}
            if len(keys) != 6 or any(m['world_key'] not in keys or m['person_id'] not in people_by_id
                                    or m['role'] not in {'member','viewer'} or not m['active'] for m in memberships):
                raise ValueError('Invalid memberships or world scopes')
            pairs = {(m['person_id'],m['world_key']) for m in memberships}
            if len(pairs) != len(memberships):
                raise ValueError('Duplicate memberships')
        except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise CommandError(f'FakePlant seed invalid: {exc}') from exc
        self.stdout.write(f'FAKEPLANT FIXTURE OK: {len(people)} synthetic people, {len(memberships)} memberships, 6 Worlds')
        if options['apply'] and not options['confirm_fakeplant']:
            raise CommandError('Explicit --confirm-fakeplant required')

        # Read-only preflight on the *active Django database* before any write.
        # This is deliberately separate from the fixture's checksum validation.
        User = get_user_model()
        usernames = [p['username'] for p in people]
        emails = [p['email'] for p in people]
        universe = Universe.objects.filter(key='fakeplant').first()
        blockers = []
        if universe is None:
            blockers.append('Universe fakeplant absent dans la base Konnaxion')
        elif universe.status != 'active':
            blockers.append(f'Universe fakeplant non actif : {universe.status}')
        world_map_preview = {}
        for world_info in org['worlds']:
            key = 'fp-' + world_info['key']
            if universe is None:
                continue
            world = World.objects.filter(key=key, universe=universe).first()
            if world is None:
                blockers.append(f'World absent : {key}')
            elif world.status != 'active' or not world.current_release_id:
                blockers.append(f'World non actif ou sans release promue : {key}')
            else:
                world_map_preview[key] = world

        found_preview = {u.username: u for u in User.objects.filter(username__in=usernames)}
        for person in people:
            user = found_preview.get(person['username'])
            if user is not None and not (
                user.is_klone and user.account_type == 'human'
                and not user.is_staff and not user.is_superuser
                and user.email == person['email']
                and not user.has_usable_password()
                and not user.can_interactive_login
            ):
                blockers.append(f'Collision de compte : {person["username"]}')
        allowed_bridge_emails, rejected_email_collisions = _scan_email_collisions(
            User, people, usernames, universe, {'fp-' + w['key'] for w in org['worlds']}
        )
        self.stdout.write(
            f'COURRIELS FAKEPLANT : {allowed_bridge_emails} clones techniques de release '
            f'verifies, {len(rejected_email_collisions)} collisions non autorisees.'
        )
        if rejected_email_collisions:
            blockers.append(f'Collisions de courriels non autorisees : {len(rejected_email_collisions)}')
            for name, reason in rejected_email_collisions[:5]:
                blockers.append(f'{name} : {reason}')

        um_count = 0
        wm_count = 0
        if universe is not None:
            universe_memberships = UniverseMembership.objects.filter(
                universe=universe, user__username__in=usernames
            ).select_related('user')
            um_count = universe_memberships.count()
            for member in universe_memberships:
                if member.role != 'member' or not member.is_active:
                    blockers.append(f'Adhesion Universe divergente : {member.user.username}')
            if world_map_preview:
                expected_roles = {
                    (people_by_id[relation['person_id']]['username'],
                     'fp-' + relation['world_key']): relation['role']
                    for relation in memberships
                }
                world_memberships = WorldMembership.objects.filter(
                    world__in=list(world_map_preview.values()),
                    user__username__in=usernames
                ).select_related('user', 'world')
                wm_count = world_memberships.count()
                for member in world_memberships:
                    role = expected_roles.get((member.user.username, member.world.key))
                    if role is None or member.role != role or not member.is_active:
                        blockers.append(
                            f'Adhesion World divergente : {member.user.username}/{member.world.key}'
                        )

        self.stdout.write(
            f'BASE KONNAXION (lecture seule) : '
            f'{len(found_preview)}/900 comptes existants, '
            f'{um_count} adhesions Universe, '
            f'{wm_count} adhesions World; '
            f'{len(world_map_preview)}/6 Worlds actifs avec release.'
        )
        self.stdout.write(
            'Personas Konnaxion : is_klone=True, mot de passe inutilisable; '
            'connexion interactive interdite par la politique applicative.'
        )
        if blockers:
            for error in blockers[:20]:
                self.stderr.write(f'[BLOQUE] {error}')
            if len(blockers) > 20:
                self.stderr.write(f'[BLOQUE] +{len(blockers)-20} autres problemes')
            raise CommandError('Preflight FakePlant refuse; aucune ecriture de cet importeur')
        if not options['apply']:
            self.stdout.write('[OK] PREVIEW EN LECTURE SEULE. Aucun compte cree.')
            self.stdout.write('Pour importer : sauvegarde Neon puis lanceur confirme seulement.')
            return
        with transaction.atomic():
            universe = Universe.objects.select_for_update().filter(key='fakeplant').first()
            if not universe or universe.status != 'active':
                raise CommandError('Build/promote the fakeplant Universe first')
            world_map = {}
            for w in org['worlds']:
                key = 'fp-' + w['key']
                world = World.objects.filter(key=key, universe=universe, status='active').first()
                if not world or not world.current_release_id:
                    raise CommandError(f'World not promoted: {key}')
                world_map[w['key']] = world
            if Universe.objects.exclude(pk=universe.pk).filter(key='fakeplant').exists():
                raise CommandError('Universe key conflict')
            # Verify every account and membership before any insert. Fail closed on takeover.
            usernames = [p['username'] for p in people]
            found = {u.username: u for u in User.objects.filter(username__in=usernames)}
            for person in people:
                u = found.get(person['username'])
                if u and not (u.is_klone and u.account_type=='human' and not u.is_staff
                              and not u.is_superuser and u.email == person['email']
                              and not u.has_usable_password()
                              and not u.can_interactive_login):
                    raise CommandError(f'User collision: {person["username"]}')
            # Recheck ALL foreign email overlaps in the write transaction,
            # not only at preview, before inserting any user or membership.
            allowed_again, refused_again = _scan_email_collisions(
                User, people, usernames, universe, {'fp-' + w['key'] for w in org['worlds']}
            )
            if refused_again:
                raise CommandError(
                    f'Import refused: {len(refused_again)} unexpected email collisions '
                    '(changed since preflight or not verified World/release bridges)'
                )
            for p in people:
                u = found.get(p['username'])
                if u is None:
                    u = User(username=p['username'], name=p['display_name'], email=p['email'],
                             account_type='human', is_klone=True, is_active=True,
                             is_ethikos_elite=False, is_staff=False, is_superuser=False)
                    u.set_unusable_password()
                    u.save()
                    found[p['username']] = u
                m, created = UniverseMembership.objects.get_or_create(universe=universe, user=u,
                    defaults={'role':'member','is_active':True})
                if not created and (m.role != 'member' or not m.is_active):
                    raise CommandError(f'Existing Universe membership differs: {u.username}')
            for relation in memberships:
                p = people_by_id[relation['person_id']]
                user = found[p['username']]
                world = world_map[relation['world_key']]
                m, created = WorldMembership.objects.get_or_create(world=world,user=user,
                    defaults={'role':relation['role'],'is_active':True})
                if not created and (m.role != relation['role'] or not m.is_active):
                    raise CommandError(f'Existing World membership differs: {user.username}/{world.key}')
        self.stdout.write(self.style.SUCCESS('900 personas and 2,736 membership bindings created/reused.'))
        self.stdout.write('IMPORTANT: only identity projection; not a live portable Kristal mount.')

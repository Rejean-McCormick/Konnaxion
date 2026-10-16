"""Import *synthetic* FakePlant directory and world memberships, safely and idempotently.

Does not enable authentication or implement Kristal live sync/detach.
Only registered inside Konnaxion host, not the separate Konnaxion_Worlds engine.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from konnaxion.worlds.models import Universe, UniverseMembership, World, WorldMembership


class Command(BaseCommand):
    help = "FakePlant: preview or provision 900 synthetic, non-login Konnaxion identities"

    def add_arguments(self, parser):
        parser.add_argument('--apply', action='store_true', help='Write; default is read-only preview')
        parser.add_argument('--confirm-fakeplant', action='store_true', help='Required with --apply')

    def handle(self, *args, **options):
        root = Path(settings.BASE_DIR).parent.parent / 'Konnaxion_Worlds' / 'fakeplant' / 'fixture'
        if not root.is_dir():
            raise CommandError('Konnaxion_Worlds/fakeplant/fixture introuvable; placer les dépôts côte à côte')
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
        self.stdout.write(f'FAKEPLANT PREVIEW: {len(people)} synthetic people, {len(memberships)} memberships, 6 Worlds')
        if not options['apply']:
            self.stdout.write('Read-only. To write: --apply --confirm-fakeplant (after Worlds build).')
            return
        if not options['confirm_fakeplant']:
            raise CommandError('Explicit --confirm-fakeplant required')
        User = get_user_model()
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
                              and not u.has_usable_password()):
                    raise CommandError(f'User collision: {person["username"]}')
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

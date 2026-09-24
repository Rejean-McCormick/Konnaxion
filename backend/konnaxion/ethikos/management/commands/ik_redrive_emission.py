from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from konnaxion.ethikos.models import InteractionEmission
from konnaxion.worlds.models import World
from konnaxion.worlds.services.tasks import WorldTaskContextError, world_release_scope


class Command(BaseCommand):
    help = (
        "Redrive one dead/retrying Interaction Kernel emission inside an explicit "
        "World/Release without changing its identity."
    )

    def add_arguments(self, parser):
        parser.add_argument("emission_id", type=int)
        parser.add_argument("--world", required=True, dest="world_key")
        parser.add_argument("--release-id", type=int, default=None)

    def handle(self, *args, **options):
        emission_id = options["emission_id"]
        world_key = options["world_key"]
        try:
            world = World.objects.select_related("current_release").get(key=world_key)
        except World.DoesNotExist as exc:
            raise CommandError(f"Unknown World {world_key!r}") from exc

        release_id = options.get("release_id") or world.current_release_id
        if not release_id:
            raise CommandError(f"World {world_key!r} has no current release")

        try:
            with world_release_scope(world_id=world.id, release_id=release_id):
                with transaction.atomic():
                    try:
                        emission = InteractionEmission.objects.select_for_update().get(pk=emission_id)
                    except InteractionEmission.DoesNotExist as exc:
                        raise CommandError(
                            f"InteractionEmission {emission_id} not found in {world_key} release {release_id}"
                        ) from exc
                    if emission.status == InteractionEmission.STATUS_DELIVERED:
                        raise CommandError("Delivered emissions cannot be redriven")
                    emission.status = InteractionEmission.STATUS_QUEUED
                    emission.next_attempt_at = None
                    emission.save(update_fields=["status", "next_attempt_at", "updated_at"])
        except WorldTaskContextError as exc:
            raise CommandError(str(exc)) from exc

        from konnaxion.ethikos.tasks import deliver_interaction_emission_task
        deliver_interaction_emission_task.delay(
            emission_id,
            world_id=world.id,
            release_id=release_id,
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Queued IK emission {emission_id} for {world_key} release {release_id}"
            )
        )

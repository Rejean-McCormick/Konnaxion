from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from konnaxion.ethikos.models import InteractionEmission


class Command(BaseCommand):
    help = "Redrive one dead/retrying Interaction Kernel emission without changing its identity."

    def add_arguments(self, parser):
        parser.add_argument("emission_id", type=int)

    def handle(self, *args, **options):
        emission_id = options["emission_id"]
        with transaction.atomic():
            try:
                emission = InteractionEmission.objects.select_for_update().get(pk=emission_id)
            except InteractionEmission.DoesNotExist as exc:
                raise CommandError(f"InteractionEmission {emission_id} not found") from exc
            if emission.status == InteractionEmission.STATUS_DELIVERED:
                raise CommandError("Delivered emissions cannot be redriven")
            emission.status = InteractionEmission.STATUS_QUEUED
            emission.next_attempt_at = None
            emission.save(update_fields=["status", "next_attempt_at", "updated_at"])
        from konnaxion.ethikos.tasks import deliver_interaction_emission_task
        deliver_interaction_emission_task.delay(emission_id)
        self.stdout.write(self.style.SUCCESS(f"Queued IK emission {emission_id}"))

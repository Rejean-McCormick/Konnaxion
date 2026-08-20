"""
Django management command to load the ISCED-F taxonomy fixture
into the expertise_category table.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from konnaxion.ekoh.models.taxonomy import ExpertiseCategory


class Command(BaseCommand):
    help = "Load UNESCO ISCED-F 2013 taxonomy from fixtures/isced_f_2013.json"

    def handle(self, *args, **options):
        fixture_path = Path(__file__).resolve().parents[2] / "fixtures" / "isced_f_2013.json"
        if not fixture_path.exists():
            self.stderr.write(self.style.ERROR(f"Fixture not found: {fixture_path}"))
            return

        data = json.loads(fixture_path.read_text(encoding="utf-8"))

        self.stdout.write(f"Loading {len(data)} categories from {fixture_path}…")
        with transaction.atomic():
            # Clear existing table (idempotent)
            ExpertiseCategory.objects.all().delete()

            # Create in two passes: parents first, then children
            # Assuming fixture entries include 'parent_code'
            code_to_obj = {}
            # Pass 1: create root and broad domains (parent_code == None)
            for entry in data:
                if entry.get("parent_code") in (None, "", "null"):
                    obj = ExpertiseCategory.objects.create(
                        code=entry["code"],
                        name=entry["name"],
                        depth=entry.get("depth", 0),
                        path=entry["code"],
                    )
                    code_to_obj[entry["code"]] = obj

            # Pass 2: create children
            to_process = [e for e in data if e.get("parent_code")]
            while to_process:
                entry = to_process.pop(0)
                parent = code_to_obj.get(entry["parent_code"])
                if not parent:
                    # parent not yet created—requeue
                    to_process.append(entry)
                    continue
                path = f"{parent.path}.{entry['code']}"
                obj = ExpertiseCategory.objects.create(
                    code=entry["code"],
                    name=entry["name"],
                    parent=parent,
                    depth=entry.get("depth", parent.depth + 1),
                    path=path,
                )
                code_to_obj[entry["code"]] = obj

        self.stdout.write(self.style.SUCCESS("ISCED-F taxonomy loaded successfully."))

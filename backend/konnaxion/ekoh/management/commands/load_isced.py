"""Load/update Konnaxion's domain-bearing ISCED-F 2013 expertise profile."""

from __future__ import annotations

from collections import Counter
import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from konnaxion.ekoh.db import set_local_ekoh_smartvote_search_path
from konnaxion.ekoh.models.taxonomy import ExpertiseCategory


EXPECTED_PROFILE_COUNTS = {0: 10, 1: 26, 2: 77}
EXPECTED_CODE_LENGTH = {0: 2, 1: 3, 2: 4}


def _validate_profile(entries: list[dict]) -> None:
    """Fail closed when the bundled EkoH ISCED-F profile is incomplete or malformed."""

    codes: dict[str, dict] = {}
    counts = Counter()

    for entry in entries:
        code = str(entry.get("code", "")).strip()
        name = str(entry.get("name", "")).strip()
        parent_code = entry.get("parent_code")

        try:
            depth = int(entry.get("depth"))
        except (TypeError, ValueError):
            raise CommandError(f"Invalid ISCED-F depth: {entry!r}") from None

        if depth not in EXPECTED_PROFILE_COUNTS:
            raise CommandError(f"Unsupported ISCED-F depth {depth!r}: {entry!r}")
        if not code or not name:
            raise CommandError(f"Invalid ISCED-F entry: {entry!r}")
        if code in codes:
            raise CommandError(f"Duplicate ISCED-F code: {code!r}")
        if len(code) != EXPECTED_CODE_LENGTH[depth] or not code.isdigit():
            raise CommandError(
                f"Invalid ISCED-F code {code!r} for depth {depth}; "
                f"expected {EXPECTED_CODE_LENGTH[depth]} digits."
            )
        if code.startswith("00"):
            raise CommandError(
                "Generic ISCED-F field 00 is outside the default EkoH expertise profile."
            )
        if depth == 0 and parent_code not in (None, "", "null"):
            raise CommandError(f"Broad field {code!r} must not have a parent.")
        if depth > 0 and parent_code in (None, "", "null"):
            raise CommandError(f"ISCED-F code {code!r} is missing its parent.")

        codes[code] = entry
        counts[depth] += 1

    if dict(counts) != EXPECTED_PROFILE_COUNTS:
        raise CommandError(
            "Incomplete EkoH ISCED-F 2013 profile: "
            f"expected {EXPECTED_PROFILE_COUNTS}, got {dict(counts)}."
        )

    for code, entry in codes.items():
        depth = int(entry["depth"])
        if depth == 0:
            continue
        parent_code = str(entry["parent_code"])
        parent = codes.get(parent_code)
        if parent is None:
            raise CommandError(
                f"Missing parent {parent_code!r} for ISCED-F code {code!r}."
            )
        if int(parent["depth"]) != depth - 1:
            raise CommandError(
                f"Invalid parent depth for ISCED-F code {code!r}: {parent_code!r}."
            )


class Command(BaseCommand):
    help = (
        "Upsert Konnaxion's UNESCO ISCED-F 2013 expertise profile "
        "(10 broad / 26 narrow / 77 detailed fields) from "
        "fixtures/isced_f_2013.json"
    )

    def handle(self, *args, **options):
        fixture_path = (
            Path(__file__).resolve().parents[2] / "fixtures" / "isced_f_2013.json"
        )
        if not fixture_path.exists():
            raise CommandError(f"Fixture not found: {fixture_path}")

        data = json.loads(fixture_path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise CommandError("ISCED-F fixture must contain a JSON list.")

        _validate_profile(data)

        entries = sorted(
            data,
            key=lambda entry: (
                int(entry.get("depth", 0)),
                str(entry.get("code", "")),
            ),
        )

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            # Local settings may not carry the startup search_path. Keep the
            # schema change transaction-local so public Konnaxion tables are
            # unaffected after this command completes.
            set_local_ekoh_smartvote_search_path()
            code_to_obj: dict[str, ExpertiseCategory] = {
                obj.code: obj for obj in ExpertiseCategory.objects.all()
            }

            for entry in entries:
                code = str(entry.get("code", "")).strip()
                name = str(entry.get("name", "")).strip()
                parent_code = entry.get("parent_code")
                depth = int(entry.get("depth", 0))

                parent = None
                if parent_code not in (None, "", "null"):
                    parent = code_to_obj.get(str(parent_code))
                    if parent is None:
                        raise CommandError(
                            f"Missing parent {parent_code!r} for ISCED-F code {code!r}."
                        )

                path = code if parent is None else f"{parent.path}.{code}"
                defaults = {
                    "name": name,
                    "parent": parent,
                    "depth": depth,
                    "path": path,
                }
                obj, created = ExpertiseCategory.objects.update_or_create(
                    code=code,
                    defaults=defaults,
                )
                code_to_obj[code] = obj
                if created:
                    created_count += 1
                else:
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "ISCED-F expertise profile synchronized: "
                f"{created_count} created, {updated_count} updated; "
                "existing EkoH user scores preserved."
            )
        )

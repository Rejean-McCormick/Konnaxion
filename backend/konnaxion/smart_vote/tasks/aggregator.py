# konnaxion/smart_vote/tasks/aggregator.py
"""
Aggregator logic:

1. Pulls Vote rows created since the last run (uses id > cursor).
2. Sums their weighted values per (target_type, target_id) combination.
3. UPSERTs into vote_result (sum_weighted_value, vote_count).

This module contains plain Python logic (no Celery task here).
The Celery task wrapper lives in konnaxion.smart_vote.tasks.__init__.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from decimal import Decimal

from django.db import transaction, connection

from konnaxion.smart_vote.models.core import Vote, VoteResult

LOGGER = logging.getLogger(__name__)
CURSOR_KEY = "ekoh_smartvote.last_vote_id"


def _load_cursor() -> int:
    """Fetch last processed vote id from pg_settings (simple key-value)."""
    with connection.cursor() as cur:
        cur.execute(
            "SELECT current_setting(%s, true);",
            (CURSOR_KEY,),
        )
        row = cur.fetchone()
    return int(row[0]) if row and row[0] else 0


def _save_cursor(vote_id: int) -> None:
    with connection.cursor() as cur:
        cur.execute("SELECT set_config(%s, %s, true);", (CURSOR_KEY, str(vote_id)))


def aggregate_votes(batch_size: int = 5_000) -> None:
    """
    Core aggregation routine.

    This is NOT a Celery task. It is invoked by the Celery task
    `vote_aggregate` defined in konnaxion.smart_vote.tasks.__init__.
    """
    last_id = _load_cursor()
    LOGGER.debug("Vote aggregate start (cursor=%s)", last_id)

    qs = Vote.objects.filter(id__gt=last_id).order_by("id")[:batch_size]
    if not qs.exists():
        LOGGER.debug("No new votes")
        return

    # 1) group by target
    totals: dict[tuple[str, str], dict[str, Decimal | int]] = defaultdict(
        lambda: {"sum": Decimal(0), "count": 0}
    )

    highest_id = last_id
    for v in qs:
        key = (v.target_type, str(v.target_id))
        totals[key]["sum"] += v.weighted_value
        totals[key]["count"] += 1
        highest_id = max(highest_id, v.id)

    # 2) upsert
    with transaction.atomic():
        for (t_type, t_id), agg in totals.items():
            VoteResult.objects.update_or_create(
                target_type=t_type,
                target_id=t_id,
                defaults={
                    "sum_weighted_value": agg["sum"],
                    "vote_count": agg["count"],
                },
            )
        _save_cursor(highest_id)

    LOGGER.info("Aggregated %s votes up to id %s", len(qs), highest_id)

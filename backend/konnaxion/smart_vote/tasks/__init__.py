# backend/konnaxion/smart_vote/tasks/__init__.py
"""
Celery entrypoints for Smart-Vote tasks.

Celery will autodiscover tasks from this module.
"""

from __future__ import annotations

from celery import shared_task

from .aggregator import aggregate_votes as _aggregate_votes


@shared_task(name="vote_aggregate")
def vote_aggregate():
    """
    Periodic Smart-Vote aggregation task.

    Delegates to `aggregator.aggregate_votes`, which:
      1. Reads new votes since last cursor.
      2. Aggregates weighted scores per (target_type, target_id).
      3. Upserts into `vote_result`.
    """
    _aggregate_votes()

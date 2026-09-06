"""Celery entrypoints for Smart Vote."""

from __future__ import annotations

from celery import shared_task

from .aggregator import aggregate_votes


@shared_task(name="vote_result_aggregator")
def vote_result_aggregator(batch_size: int = 5_000) -> dict[str, int]:
    """Rebuild the legacy materialized VoteResult projection."""
    return aggregate_votes(batch_size=batch_size)


@shared_task(name="vote_aggregate")
def vote_aggregate(batch_size: int = 5_000) -> dict[str, int]:
    """Backward-compatible alias for old Celery Beat rows."""
    return aggregate_votes(batch_size=batch_size)


__all__ = [
    "vote_result_aggregator",
    "vote_aggregate",
]

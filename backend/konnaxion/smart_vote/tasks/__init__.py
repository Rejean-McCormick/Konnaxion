"""Celery entrypoints for Smart Vote.

Periodic task names remain stable, but they now act as control-plane
coordinators.  Actual World-owned projection work executes in release-pinned
worker tasks carrying explicit ``world_id`` + ``release_id``.
"""

from __future__ import annotations

from celery import shared_task

from konnaxion.worlds.services.tasks import PinnedWorldTask, enqueue_for_current_releases

from .aggregator import aggregate_votes


@shared_task(
    base=PinnedWorldTask,
    name="konnaxion.smart_vote.vote_result_aggregator_world",
)
def vote_result_aggregator_world(
    *,
    world_id: int,
    release_id: int,
    batch_size: int = 5_000,
) -> dict[str, int]:
    del world_id, release_id  # scope is established by PinnedWorldTask
    return aggregate_votes(batch_size=batch_size)


@shared_task(name="vote_result_aggregator")
def vote_result_aggregator(batch_size: int = 5_000) -> dict[str, int]:
    """Fan the legacy projection rebuild out to every current WorldRelease."""
    scheduled = enqueue_for_current_releases(
        vote_result_aggregator_world,
        kwargs={"batch_size": int(batch_size)},
    )
    return {"scheduled_worlds": scheduled}


@shared_task(name="vote_aggregate")
def vote_aggregate(batch_size: int = 5_000) -> dict[str, int]:
    """Backward-compatible Celery Beat alias using the same safe fan-out."""
    scheduled = enqueue_for_current_releases(
        vote_result_aggregator_world,
        kwargs={"batch_size": int(batch_size)},
    )
    return {"scheduled_worlds": scheduled}


__all__ = [
    "vote_result_aggregator",
    "vote_aggregate",
    "vote_result_aggregator_world",
]

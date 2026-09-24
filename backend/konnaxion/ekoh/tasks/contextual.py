"""Celery entry point for contextual EkoH analysis.

The scheduled task is a global coordinator; any World-owned analysis runs only
inside a release-pinned worker context.
"""

import logging

from celery import shared_task

from konnaxion.worlds.services.tasks import PinnedWorldTask, enqueue_for_current_releases

LOGGER = logging.getLogger(__name__)


@shared_task(
    base=PinnedWorldTask,
    name="konnaxion.ekoh.contextual_analysis_world",
)
def contextual_analysis_world(*, world_id: int, release_id: int) -> int:
    del world_id, release_id
    LOGGER.info(
        "Contextual analysis skipped: no authoritative entity collector is configured."
    )
    return 0


@shared_task(name="contextual_analysis_batch")
def contextual_analysis_batch() -> int:
    """Schedule one explicit World/Release task per current World."""
    return enqueue_for_current_releases(contextual_analysis_world)

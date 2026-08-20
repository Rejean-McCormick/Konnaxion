"""Celery entry point for contextual EkoH analysis.

The previous placeholder wrote a fake analysis event using ``entity_id=None``.
Because ``ContextAnalysisLog.entity_id`` is a UUID and contextual AI analysis
is non-authoritative, the scheduled placeholder must be a safe no-op until a
real entity collector exists.
"""

import logging

from celery import shared_task

LOGGER = logging.getLogger(__name__)


@shared_task(name="contextual_analysis_batch")
def contextual_analysis_batch() -> int:
    """Run no analysis until a governed entity/evidence collector is wired.

    Returns the number of entities processed.  This deliberately avoids
    creating synthetic evidence or mutating EkoH scores.
    """
    LOGGER.info(
        "Contextual analysis batch skipped: no authoritative entity collector is configured."
    )
    return 0

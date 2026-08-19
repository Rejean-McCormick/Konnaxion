"""Celery task for EkoH score recalculation.

Recalculation is fail-safe: no profile is overwritten until a real evidence
collector returns complete metrics for a user/domain pair.
"""

from __future__ import annotations

import logging
from itertools import islice
from typing import Iterable, Iterator, Mapping

from celery import shared_task
from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from konnaxion.ekoh.models.taxonomy import ExpertiseCategory
from konnaxion.ekoh.services.multidimensional_scoring import compute_user_domain_score

LOGGER = logging.getLogger(__name__)
User = get_user_model()
CHUNK_SIZE = 1_000


def chunked(iterable: Iterable[int], size: int) -> Iterator[list[int]]:
    it = iter(iterable)
    while chunk := list(islice(it, size)):
        yield chunk


def _collect_metrics(
    user_id: int,
    domain: ExpertiseCategory,
) -> Mapping[str, float] | None:
    """Return verified scoring metrics, or ``None`` when none are available.

    A placeholder must never return synthetic zeros: doing so would erase
    imported or previously verified EkoH expertise during the nightly task.
    Replace this function with the governed evidence aggregation pipeline.
    """
    return None


@shared_task(name="ekoh_score_recalc")
def recalc_all_scores() -> dict[str, int]:
    LOGGER.info("EkoH score rebuild started")
    domains: QuerySet[ExpertiseCategory] = ExpertiseCategory.objects.filter(depth__gte=1)

    processed = 0
    skipped = 0
    for user_chunk in chunked(
        User.objects.values_list("id", flat=True).order_by("id"),
        CHUNK_SIZE,
    ):
        for uid in user_chunk:
            for domain in domains:
                metrics = _collect_metrics(uid, domain)
                if metrics is None:
                    skipped += 1
                    continue
                compute_user_domain_score(uid, domain, metrics, flush=True)
                processed += 1

    LOGGER.info(
        "EkoH score rebuild completed: processed=%s skipped=%s",
        processed,
        skipped,
    )
    return {"processed": processed, "skipped": skipped}

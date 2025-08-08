"""
Celery task: ekoh_score_recalc

* Runs nightly (see tasks_schedule.md).
* Iterates through all users and relevant expertise domains.
* Calls `compute_user_domain_score` to update weighted scores in DB.
"""

from __future__ import annotations

import logging
from itertools import islice
from typing import Iterable, Iterator

from celery import shared_task
from django.contrib.auth import get_user_model
from django.db.models import QuerySet

from konnaxion.ekoh.models.taxonomy import ExpertiseCategory
from konnaxion.ekoh.services.multidimensional_scoring import (
    compute_user_domain_score,
)

LOGGER = logging.getLogger(__name__)
User = get_user_model()

CHUNK_SIZE = 1_000  # tune based on RAM


def chunked(iterable: Iterable[int], size: int) -> Iterator[list[int]]:
    """Yield lists of `size` items from iterable."""
    it = iter(iterable)
    while (chunk := list(islice(it, size))):
        yield chunk


def _collect_metrics(user_id: int, domain: ExpertiseCategory):
    """
    Placeholder metric collector.

    Replace with real aggregation of quality / expertise / frequency.
    For now just returns dummy 0s so task runs without error.
    """
    return {"quality": 0, "expertise": 0, "frequency": 0}


@shared_task(name="ekoh_score_recalc")
def recalc_all_scores() -> None:
    LOGGER.info("EkoH score rebuild started")
    domains: QuerySet[ExpertiseCategory] = ExpertiseCategory.objects.filter(depth__gte=1)

    for user_chunk in chunked(
        User.objects.values_list("id", flat=True).order_by("id"), CHUNK_SIZE
    ):
        for uid in user_chunk:
            for domain in domains:
                metrics = _collect_metrics(uid, domain)
                compute_user_domain_score(uid, domain, metrics, flush=True)
        LOGGER.debug("Processed %s users", len(user_chunk))

    LOGGER.info("EkoH score rebuild completed")

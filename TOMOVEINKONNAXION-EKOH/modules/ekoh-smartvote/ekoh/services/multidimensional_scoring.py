"""
Multidimensional scoring engine.

Converts raw activity metrics into a weighted EkoH merit score
along three axes:

    • quality      (peer review, up-votes, moderator marks…)
    • expertise    (credentials, publications, citations…)
    • frequency    (participation cadence)

Final formula (from 03-technical_spec.md §2 .2 .1):

    S_u,d  =  Σ_i  ( R_i  ·  N_i,u,d )

        where:
          R_i  =  runtime weight  (RAW_WEIGHT_QUALITY, etc.)
          N_i  =  normalised metric on axis *i* for user *u* & domain *d*

Normalisation is performed as **percent-rank** over the *domain* cohort
(avoids cross-domain bias).
"""

from __future__ import annotations

import logging
from decimal import Decimal
from typing import Iterable, Mapping

from django.db.models import F, Window
from django.db.models.functions import PercentRank

from konnaxion.ekoh.models.config import ScoreConfiguration
from konnaxion.ekoh.models.scores import (
    UserExpertiseScore,
)
from konnaxion.ekoh.models.taxonomy import ExpertiseCategory

LOGGER = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# helper – fetch runtime weights (cached for 60 s with simple lru)            #
# --------------------------------------------------------------------------- #
from functools import lru_cache
from time import time


@lru_cache(maxsize=1)
def _weights_cache() -> Mapping[str, Decimal]:
    """Return RAW_WEIGHT coefficients as {name: Decimal}."""
    rows = (
        ScoreConfiguration.objects.filter(weight_name__startswith="RAW_WEIGHT_")
        .values_list("weight_name", "weight_value")
    )
    return {name: Decimal(value) for name, value in rows}


def get_raw_weights(force_refresh: bool = False) -> Mapping[str, Decimal]:
    if force_refresh:
        _weights_cache.cache_clear()
    return _weights_cache()


# --------------------------------------------------------------------------- #
# main API                                                                    #
# --------------------------------------------------------------------------- #
AXES = ("quality", "expertise", "frequency")


def compute_user_domain_score(
    user_id: int,
    domain: ExpertiseCategory,
    metrics: Mapping[str, Decimal],
    *,
    flush: bool = True,
) -> Decimal:
    """
    Compute weighted score **S_u,d** for one user in one domain.

    Parameters
    ----------
    user_id : int
        ID of auth_user
    domain : ExpertiseCategory
        Leaf or parent domain
    metrics : dict
        Raw axis metrics already gathered by callers:
          {"quality": 87, "expertise": 66, "frequency": 12}
    flush : bool
        Persist result into UserExpertiseScore table if True.

    Returns
    -------
    Decimal
        Weighted score between 0 and 100 (rounded to 4 decimals)
    """
    raw_weights = get_raw_weights()
    missing = [ax for ax in AXES if ax not in metrics]
    if missing:  # pragma: no cover
        raise ValueError(f"Missing metric(s): {', '.join(missing)}")

    # Percent-rank normalisation within domain cohort
    normalised = _percent_rank(metrics, domain)

    weighted_sum = Decimal("0")
    for axis in AXES:
        weighted_sum += raw_weights[f"RAW_WEIGHT_{axis.upper()}"] * normalised[axis]

    score = weighted_sum.quantize(Decimal("0.0001"))

    if flush:
        UserExpertiseScore.objects.update_or_create(
            user_id=user_id,
            category=domain,
            defaults={
                "raw_score": sum(metrics.values()),
                "weighted_score": score,
            },
        )
    return score


# --------------------------------------------------------------------------- #
# internal helpers                                                            #
# --------------------------------------------------------------------------- #
def _percent_rank(
    metric_map: Mapping[str, Decimal], domain: ExpertiseCategory
) -> Mapping[str, Decimal]:
    """
    Convert raw axis values to 0-1 scale using PercentRank over cohort.

    Cohort = users who have any score row in this *domain* OR its descendants.
    """
    # Gather cohort scores in one ORM query per axis
    cohort_qs = (
        UserExpertiseScore.objects.filter(category__path__descendant=domain.path)
        .values("user_id")
        .annotate(raw_axis=F("raw_score"))
    )

    norm: dict[str, Decimal] = {}
    for axis in AXES:
        ranked = (
            cohort_qs.annotate(
                pct=Window(expression=PercentRank(), order_by=F("raw_axis").asc())
            )
            .filter(raw_axis=metric_map[axis])
            .first()
        )
        norm[axis] = Decimal(ranked["pct"] if ranked else 0)
    return norm

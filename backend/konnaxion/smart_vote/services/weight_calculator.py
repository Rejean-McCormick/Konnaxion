"""
Weight-calculator — core of Smart-Vote.

Formula  (see 03-technical_spec.md §2.3):

    W_u,c  =  min(
                 Σ_d  ( R_c,d  ·  S_u,d )  ,  ethical_cap
             )  ×  ethics_multiplier

where
    •  R_c,d          = relevance weight for consultation *c* & domain *d*
    •  S_u,d          = user weighted expertise score for domain *d*
    •  ethics_multiplier  = 1 + (ethical_score – 1) * α
    •  ethical_cap    = EKOH_MULTIPLIER_CAP  (env / param)

This module exposes the single public function:

    get_weight(user_id: int, consultation_id: uuid) -> Decimal
"""

from __future__ import annotations

import logging
from decimal import Decimal
from functools import lru_cache
from typing import Dict

from django.db.models import Sum
from django.conf import settings

from konnaxion.ekoh.models.scores import UserExpertiseScore, UserEthicsScore
from konnaxion.ekoh.models.config import ScoreConfiguration
from konnaxion.smart_vote.models.core import VoteModality
from konnaxion.ekoh.models.taxonomy import ExpertiseCategory

# [FIX] Corrected imports: Consultation and ConsultationRelevance are in their own files, not core.py
from konnaxion.smart_vote.models.consultation import Consultation
from konnaxion.smart_vote.models.consultation_relevance import ConsultationRelevance

LOGGER = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
#  Runtime tunables                                                           #
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=32)
def _fetch_param(name: str) -> Decimal:
    """Read a numeric param from score_configuration (cached)."""
    # Avoid hitting DB at import time; call only when needed
    obj = ScoreConfiguration.objects.filter(weight_name=name).first()
    if obj is None:
        # Fallback or raise. For safety in dev, let's default to 1.0 if missing to avoid hard crashes
        # raise RuntimeError(f"Missing parameter {name}")
        return Decimal("1.0")
    return Decimal(obj.weight_value)


def ethical_cap() -> Decimal:
    return _fetch_param("EKOH_MULTIPLIER_CAP")


# --------------------------------------------------------------------------- #
#  Cached helpers                                                             #
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=512)
def _relevance_vector(consultation_id) -> Dict[int, Decimal]:
    """Return {category_id: relevance_weight} for a consultation."""
    rows = ConsultationRelevance.objects.filter(
        consultation_id=consultation_id
    ).values_list("category_id", "weight")
    return {cid: Decimal(w) for cid, w in rows}


@lru_cache(maxsize=5_000)
def _expertise_vector(user_id: int) -> Dict[int, Decimal]:
    """Return {category_id: weighted_score} for a user."""
    rows = UserExpertiseScore.objects.filter(user_id=user_id).values_list(
        "category_id", "weighted_score"
    )
    return {cid: Decimal(s) for cid, s in rows}


def _ethics_multiplier(user_id: int) -> Decimal:
    row = UserEthicsScore.objects.filter(user_id=user_id).first()
    if not row:
        return Decimal("1.0")
    # α = 1 by default (linear); tweak if needed
    return Decimal(row.ethical_score)


# --------------------------------------------------------------------------- #
#  Public API                                                                 #
# --------------------------------------------------------------------------- #
def get_weight(user_id: int, consultation_id) -> Decimal:
    """
    Calculate voting weight for user on a given consultation.

    Steps
    -----
    1. Dot-product relevance vector with user expertise vector.
    2. Cap result by EKOH_MULTIPLIER_CAP.
    3. Multiply by ethics multiplier.
    """
    rel_vec = _relevance_vector(consultation_id)
    exp_vec = _expertise_vector(user_id)

    dot = sum(rel_vec.get(cid, 0) * exp_vec.get(cid, 0) for cid in rel_vec)

    capped = min(dot, ethical_cap())
    weight = (Decimal(capped) * _ethics_multiplier(user_id)).quantize(
        Decimal("0.0001")
    )

    LOGGER.debug(
        "Weight u=%s c=%s  dot=%s  capped=%s  ethics× => %s",
        user_id,
        consultation_id,
        dot,
        capped,
        weight,
    )
    return weight
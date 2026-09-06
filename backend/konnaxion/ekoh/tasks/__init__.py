"""Celery task discovery for EkoH."""

from .contextual import contextual_analysis_batch
from .recalc import recalc_all_scores

__all__ = [
    "contextual_analysis_batch",
    "recalc_all_scores",
]

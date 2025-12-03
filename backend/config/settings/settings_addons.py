# FILE: backend/config/settings/settings_addons.py
"""
EkoH / Smart-Vote integration settings.

This module is imported at the end of config/settings/base.py.
It:
- Defines the EkoH and Smart-Vote Django apps to be added.
- Defines Celery beat schedules for their maintenance tasks.
- Exposes Kafka bootstrap configuration for Smart-Vote.
"""

from datetime import timedelta
import os

from celery.schedules import crontab

# ---------------------------------------------------------------------------
# Apps - Define them here, merge them in base.py
# ---------------------------------------------------------------------------

EKOH_INSTALLED_APPS = [
    "konnaxion.ekoh",
    "konnaxion.smart_vote",
]

# ---------------------------------------------------------------------------
# Celery – periodic tasks for EkoH & Smart-Vote
# ---------------------------------------------------------------------------

EKOH_CELERY_BEAT_SCHEDULE = {
    # Nightly full score recomputation
    "ekoh-score-recalc": {
        "task": "ekoh_score_recalc",
        "schedule": crontab(hour=2, minute=0),
    },
    # Periodic contextual analysis batch (every 30 minutes)
    "ekoh-contextual-analysis": {
        "task": "contextual_analysis_batch",
        "schedule": crontab(minute="*/30"),
    },
    # Smart-Vote aggregation: roll up new votes into VoteResult
    "smartvote-vote-aggregate": {
        "task": "vote_aggregate",
        "schedule": timedelta(minutes=1),
    },
}

# ---------------------------------------------------------------------------
# Kafka (for Smart-Vote streaming / ledger flows)
# ---------------------------------------------------------------------------

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS",
    "localhost:9092",
)
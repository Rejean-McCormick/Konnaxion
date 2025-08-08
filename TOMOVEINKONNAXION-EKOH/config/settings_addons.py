import os
from datetime import timedelta
from pathlib import Path

# ── Secret key fallback (local only) ────────────────────────────────
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-secret-change-me")

# ── Register EkoH & Smart-Vote apps ────────────────────────────────
INSTALLED_APPS += ["konnaxion.ekoh", "konnaxion.smart_vote"]

# ── Shared-schema search_path ──────────────────────────────────────
DATABASES["default"].setdefault("OPTIONS", {})
DATABASES["default"]["OPTIONS"]["options"] = "-c search_path=ekoh_smartvote,public"

# ── Celery settings ────────────────────────────────────────────────
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
CELERY_TIMEZONE = "UTC"

from celery.schedules import crontab  # noqa: E402

CELERY_BEAT_SCHEDULE = {
    "ekoh-score-recalc": {
        "task": "ekoh_score_recalc",
        "schedule": crontab(hour=2, minute=0),  # nightly
    },
    "vote-aggregate": {
        "task": "vote_aggregate",
        "schedule": timedelta(seconds=60),
    },
}

# ── Kafka bootstrap (optional) ─────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

# ── Fixture directory for load_isced command ───────────────────────
FIXTURE_DIRS = [
    Path(__file__).resolve().parent.parent
    / "modules"
    / "ekoh-smartvote"
    / "ekoh"
    / "fixtures"
]

"""
Smart-Vote Django-app configuration.

• Shares the **same schema** (`ekoh_smartvote`) as the Ekoh app.
• Ensures the schema and required extensions exist
  (ltree & pgcrypto already installed by EkohConfig, but
  we guard idempotently in case this app is run standalone).
"""

import logging
from django.apps import AppConfig
from django.db import connection

LOGGER = logging.getLogger(__name__)
SCHEMA = "ekoh_smartvote"


class SmartVoteConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "konnaxion.smart_vote"
    verbose_name = "Smart-Vote – Weighted Balloting"

    def ready(self) -> None:  # noqa: D401  (simple present)
        """
        Ensure schema exists and search_path is set for this connection.
        """
        with connection.cursor() as cur:
            cur.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA};")
            cur.execute(f"SET search_path TO {SCHEMA}, public;")
            # Extensions are no-ops if already installed
            cur.execute("CREATE EXTENSION IF NOT EXISTS ltree;")
            cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
        LOGGER.debug("Smart-Vote search_path initialised (%s,public)", SCHEMA)

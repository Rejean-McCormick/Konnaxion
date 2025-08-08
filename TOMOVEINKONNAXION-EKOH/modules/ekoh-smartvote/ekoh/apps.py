"""
Ekoh Django-app configuration.

• Sets the default `search_path` so all raw SQL and migrations operate
  inside the `ekoh_smartvote` schema first, then fall back to `public`.
• Declares the app label `konnaxion.ekoh` so cross-module imports remain
  stable even if the module is moved to its own repo later.
"""

import logging
from django.apps import AppConfig
from django.db import connection

LOGGER = logging.getLogger(__name__)

EKOH_SCHEMA = "ekoh_smartvote"


class EkohConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "konnaxion.ekoh"
    verbose_name = "EkoH – Expertise & Ethics"

    def ready(self) -> None:  # noqa: D401  (simple present)
        """
        Ensure the custom schema exists and set the session search_path.

        Called once per Django process start-up.
        """
        with connection.cursor() as cur:
            # 1) Create the schema if it doesn't exist.
            cur.execute(
                f"CREATE SCHEMA IF NOT EXISTS {EKOH_SCHEMA};"
            )
            # 2) Apply search_path for the current connection.
            cur.execute(
                f"SET search_path TO {EKOH_SCHEMA}, public;"
            )
            LOGGER.debug("search_path set to %s,public", EKOH_SCHEMA)

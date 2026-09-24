"""PostgreSQL schema scope helpers for EkoH / Smart Vote.

Local Konnaxion settings deliberately remove PostgreSQL startup ``search_path``
options because some pooled Postgres providers reject them. EkoH and Smart Vote
nevertheless have legacy tables in the ``ekoh_smartvote`` schema.

When a Konnaxion World runtime is active, these helpers MUST preserve the
release-local auxiliary/domain search path. Falling back to the legacy global
schema from inside a World request/import would leak cross-World data.
"""

from __future__ import annotations

from contextlib import contextmanager

from django.db import connection, transaction

EKOH_SMARTVOTE_SEARCH_PATH_SQL = "SET LOCAL search_path TO ekoh_smartvote, public"


def _active_world_runtime():
    # Import lazily so EkoH can still be used independently from Worlds and to
    # avoid app-initialization cycles.
    try:
        from konnaxion.worlds.runtime import get_world_runtime
    except ImportError:
        return None
    return get_world_runtime()


def set_local_ekoh_smartvote_search_path() -> None:
    """Set EkoH/Smart Vote scope without escaping an active WorldRelease."""
    runtime = _active_world_runtime()
    if runtime is not None:
        from konnaxion.worlds.db import set_local_world_search_path

        set_local_world_search_path(runtime)
        return

    with connection.cursor() as cursor:
        cursor.execute(EKOH_SMARTVOTE_SEARCH_PATH_SQL)


@contextmanager
def ekoh_smartvote_db_scope():
    """Run ORM work in World-local scope when present, legacy scope otherwise."""
    with transaction.atomic():
        set_local_ekoh_smartvote_search_path()
        yield

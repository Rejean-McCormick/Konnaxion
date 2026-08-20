"""PostgreSQL schema scope helpers for EkoH / Smart Vote.

Local Konnaxion settings deliberately remove PostgreSQL startup ``search_path``
options because some pooled Postgres providers reject them.  EkoH and Smart
Vote nevertheless have legacy tables in the ``ekoh_smartvote`` schema.

Use these helpers only around EkoH/Smart Vote ORM work.  The search path is
transaction-local, so unrelated Konnaxion models continue to use their normal
schema once the block exits.
"""

from __future__ import annotations

from contextlib import contextmanager

from django.db import connection, transaction

EKOH_SMARTVOTE_SEARCH_PATH_SQL = "SET LOCAL search_path TO ekoh_smartvote, public"


def set_local_ekoh_smartvote_search_path() -> None:
    """Set the EkoH/Smart Vote search path for the current DB transaction."""
    with connection.cursor() as cursor:
        cursor.execute(EKOH_SMARTVOTE_SEARCH_PATH_SQL)


@contextmanager
def ekoh_smartvote_db_scope():
    """Run ORM work with a transaction-local EkoH/Smart Vote search path."""
    with transaction.atomic():
        set_local_ekoh_smartvote_search_path()
        yield

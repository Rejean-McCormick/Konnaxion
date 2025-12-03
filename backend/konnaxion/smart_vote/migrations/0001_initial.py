# FILE: backend/konnaxion/smart_vote/migrations/0001_initial.py
# Generated manually for smart_vote initial schema
# Django 4.2 / 5.x compatible migration

from django.db import migrations, connection, models
from django.contrib.postgres.operations import CreateExtension

SCHEMA = "ekoh_smartvote"


DDL = f"""
-- 1. schema guarantee
CREATE SCHEMA IF NOT EXISTS {SCHEMA};

-- 2. parent table: vote (range partitioned on created_at)
CREATE TABLE IF NOT EXISTS {SCHEMA}.vote (
    id              BIGSERIAL,
    user_id         INT NOT NULL,
    target_type     VARCHAR(64) NOT NULL,
    target_id       UUID  NOT NULL,
    modality_name   VARCHAR(32) NOT NULL,
    raw_value       NUMERIC(12,4) NOT NULL,
    weighted_value  NUMERIC(12,4) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    -- Partitioned tables require the partition key in the PK
    PRIMARY KEY (id, created_at),
    -- Partitioned tables require the partition key in UNIQUE constraints too
    UNIQUE (user_id, target_type, target_id, created_at)
) PARTITION BY RANGE (created_at);

-- target index
CREATE INDEX IF NOT EXISTS idx_vote_target
    ON {SCHEMA}.vote (target_type, target_id);

-- 3. vote_result (simple)
CREATE TABLE IF NOT EXISTS {SCHEMA}.vote_result (
    id                  BIGSERIAL PRIMARY KEY,
    target_type         VARCHAR(64) NOT NULL,
    target_id           UUID NOT NULL,
    sum_weighted_value  NUMERIC(20,4) NOT NULL,
    vote_count          INT NOT NULL,
    UNIQUE (target_type, target_id)
);

-- 4. parent table: vote_ledger (range partitioned on logged_at)
CREATE TABLE IF NOT EXISTS {SCHEMA}.vote_ledger (
    ledger_id    BIGSERIAL,
    vote_id      BIGINT NOT NULL,
    sha256_hash  BYTEA  NOT NULL,
    block_height BIGINT,
    logged_at    TIMESTAMP NOT NULL DEFAULT now(),
    -- Partition key must be part of PK
    PRIMARY KEY (ledger_id, logged_at)
) PARTITION BY RANGE (logged_at);

-- index for lookup
CREATE INDEX IF NOT EXISTS idx_ledger_vote
    ON {SCHEMA}.vote_ledger (vote_id);
"""


def create_parent_tables(apps, schema_editor):
    with connection.cursor() as cur:
        cur.execute(f"SET search_path TO {SCHEMA}, public;")
        cur.execute(DDL)


def make_current_month_partitions(apps, schema_editor):
    """
    Attach partitions for the current month to vote and vote_ledger.
    This runs only once; infra/db/partition_helper.sql handles future months.
    """
    import datetime as _dt

    today = _dt.date.today()
    first = today.replace(day=1)
    nxt = (first + _dt.timedelta(days=32)).replace(day=1)

    month_suffix = first.strftime("%Y_%m")
    with connection.cursor() as cur:
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {SCHEMA}.vote_{month_suffix}
                PARTITION OF {SCHEMA}.vote
                FOR VALUES FROM ('{first}') TO ('{nxt}');
        """)
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {SCHEMA}.vote_ledger_{month_suffix}
                PARTITION OF {SCHEMA}.vote_ledger
                FOR VALUES FROM ('{first}') TO ('{nxt}');
        """)


class Migration(migrations.Migration):
    initial = True

    # No cross-app deps here; later smart_vote migrations pull in ekoh.
    dependencies = []

    operations = [
        # Extensions: idempotent, safe if already present
        CreateExtension("ltree"),
        CreateExtension("pgcrypto"),
        migrations.RunPython(create_parent_tables, migrations.RunPython.noop),
        migrations.CreateModel(
            name="VoteModality",
            fields=[
                (
                    "name",
                    models.CharField(
                        max_length=32,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("parameters", models.JSONField(blank=True, null=True)),
            ],
            options={"db_table": "vote_modality"},
        ),
        migrations.RunPython(make_current_month_partitions, migrations.RunPython.noop),
    ]

# FILE: backend/konnaxion/smart_vote/migrations/0003_alter_consultation_id_alter_consultationrelevance_id_and_more.py
# Adjust Consultation + ConsultationRelevance + VoteModality,
# and register Vote / VoteResult / VoteLedger in migration state
# without re-creating the underlying tables (they come from 0001 DDL).

import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("smart_vote", "0002_consultation"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # --- 1. Fix Consultation primary key generation ---
        migrations.AlterField(
            model_name="consultation",
            name="id",
            field=models.UUIDField(
                default=uuid.uuid4,
                editable=False,
                primary_key=True,
                serialize=False,
            ),
        ),

        # --- 2. Ensure ConsultationRelevance has standard BigAutoField id ---
        migrations.AlterField(
            model_name="consultationrelevance",
            name="id",
            field=models.BigAutoField(
                auto_created=True,
                primary_key=True,
                serialize=False,
                verbose_name="ID",
            ),
        ),

        # --- 3. Update VoteModality choices (same PK, but with explicit enum choices) ---
        migrations.AlterField(
            model_name="votemodality",
            name="name",
            field=models.CharField(
                choices=[
                    ("approval", "Approval"),
                    ("ranking", "Ranking"),
                    ("rating", "Rating 1-5"),
                    ("preferential", "Preferential"),
                    ("budget_split", "Budget split"),
                ],
                max_length=32,
                primary_key=True,
                serialize=False,
            ),
        ),

        # --- 4. Register Vote / VoteResult / VoteLedger in migration STATE ONLY ---
        # The actual tables are created by smart_vote.0001_initial via raw SQL
        # (partitioned parent tables in schema ekoh_smartvote).
        migrations.SeparateDatabaseAndState(
            database_operations=[],  # DO NOT touch the DB, tables already exist
            state_operations=[
                # 4.a Vote
                migrations.CreateModel(
                    name="Vote",
                    fields=[
                        ("id", models.BigAutoField(primary_key=True, serialize=False)),
                        ("target_type", models.CharField(max_length=64)),
                        ("target_id", models.UUIDField(default=uuid.uuid4)),
                        (
                            "raw_value",
                            models.DecimalField(max_digits=12, decimal_places=4),
                        ),
                        (
                            "weighted_value",
                            models.DecimalField(max_digits=12, decimal_places=4),
                        ),
                        ("created_at", models.DateTimeField(auto_now_add=True)),
                        (
                            "modality",
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.PROTECT,
                                to="smart_vote.votemodality",
                            ),
                        ),
                        (
                            "user",
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                to=settings.AUTH_USER_MODEL,
                            ),
                        ),
                    ],
                    options={
                        "db_table": "vote",
                        # IMPORTANT: include partition key created_at so it matches the DDL
                        "unique_together": {
                            ("user", "target_type", "target_id", "created_at")
                        },
                    },
                ),

                # 4.b VoteLedger
                migrations.CreateModel(
                    name="VoteLedger",
                    fields=[
                        (
                            "ledger_id",
                            models.BigAutoField(primary_key=True, serialize=False),
                        ),
                        ("sha256_hash", models.BinaryField()),
                        (
                            "block_height",
                            models.BigIntegerField(blank=True, null=True),
                        ),
                        ("logged_at", models.DateTimeField(auto_now_add=True)),
                        (
                            "vote",
                            models.ForeignKey(
                                on_delete=django.db.models.deletion.CASCADE,
                                to="smart_vote.vote",
                            ),
                        ),
                    ],
                    options={
                        "db_table": "vote_ledger",
                    },
                ),

                # 4.c VoteResult
                migrations.CreateModel(
                    name="VoteResult",
                    fields=[
                        (
                            "id",
                            models.BigAutoField(
                                auto_created=True,
                                primary_key=True,
                                serialize=False,
                                verbose_name="ID",
                            ),
                        ),
                        ("target_type", models.CharField(max_length=64)),
                        ("target_id", models.UUIDField()),
                        (
                            "sum_weighted_value",
                            models.DecimalField(max_digits=20, decimal_places=4),
                        ),
                        ("vote_count", models.IntegerField()),
                    ],
                    options={
                        "db_table": "vote_result",
                        "unique_together": {("target_type", "target_id")},
                    },
                ),

                # 4.d Indexes (state only; DB indexes come from 0001 DDL)
                migrations.AddIndex(
                    model_name="vote",
                    index=models.Index(
                        fields=["target_type", "target_id"],
                        name="idx_vote_target",
                    ),
                ),
                migrations.AddIndex(
                    model_name="voteledger",
                    index=models.Index(
                        fields=["vote_id"],
                        name="idx_ledger_vote",
                    ),
                ),
            ],
        ),
    ]

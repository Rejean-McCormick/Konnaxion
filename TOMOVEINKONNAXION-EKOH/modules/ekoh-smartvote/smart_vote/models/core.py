"""
Core Smart-Vote tables.

Partitioning ⬇︎
-------------
`vote`, `vote_ledger` are **monthly range-partitioned** on `created_at`
and `logged_at`.  Native Django ORM can’t declare child tables, so
partition DDL is emitted in the first migration.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

from django.db import models
from django.conf import settings


# ------------------------------------------------------------------ #
# 1)  Vote modality lookup                                            #
# ------------------------------------------------------------------ #
class VoteModality(models.Model):
    """Approval, ranking, rating, preferential, budget_split …"""

    APPROVAL = "approval"
    RANKING = "ranking"
    RATING = "rating"
    PREFERENTIAL = "preferential"
    BUDGET = "budget_split"

    name = models.CharField(
        max_length=32,
        primary_key=True,
        choices=[
            (APPROVAL, "Approval"),
            (RANKING, "Ranking"),
            (RATING, "Rating 1-5"),
            (PREFERENTIAL, "Preferential"),
            (BUDGET, "Budget split"),
        ],
    )
    parameters = models.JSONField(blank=True, null=True)

    class Meta:
        db_table = "vote_modality"

    def __str__(self) -> str:  # pragma: no cover
        return self.name


# ------------------------------------------------------------------ #
# 2)  Raw vote (partitioned)                                          #
# ------------------------------------------------------------------ #
class Vote(models.Model):
    """
    One ballot cast by `user` on an arbitrary `target`.

    Partitioned **monthly** on `created_at`.
    """

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # generic FK → any model (“consultation”, “idea”, “policy” …)
    target_type = models.CharField(max_length=64)
    target_id = models.UUIDField(default=uuid.uuid4)

    modality = models.ForeignKey(VoteModality, on_delete=models.PROTECT)

    raw_value = models.DecimalField(max_digits=12, decimal_places=4)
    weighted_value = models.DecimalField(max_digits=12, decimal_places=4)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vote"
        unique_together = ("user", "target_type", "target_id")
        indexes = [
            models.Index(fields=["target_type", "target_id"], name="idx_vote_target")
        ]

    # convenience
    def __str__(self) -> str:  # pragma: no cover
        return f"{self.user_id}→{self.target_id} = {self.weighted_value}"


# ------------------------------------------------------------------ #
# 3)  Aggregated result (1 row per target)                            #
# ------------------------------------------------------------------ #
class VoteResult(models.Model):
    target_type = models.CharField(max_length=64)
    target_id = models.UUIDField()
    sum_weighted_value = models.DecimalField(max_digits=20, decimal_places=4)
    vote_count = models.IntegerField()

    class Meta:
        db_table = "vote_result"
        unique_together = ("target_type", "target_id")

    def __str__(self):  # pragma: no cover
        return f"{self.target_id} ⟹ {self.sum_weighted_value}"


# ------------------------------------------------------------------ #
# 4)  Ledger                                                           #
# ------------------------------------------------------------------ #
class VoteLedger(models.Model):
    """
    Append-only log for on-chain anchoring.

    Partitioned monthly on `logged_at`.
    """

    ledger_id = models.BigAutoField(primary_key=True)
    vote = models.ForeignKey(Vote, on_delete=models.CASCADE)
    sha256_hash = models.BinaryField()  # 32-byte SHA-256
    block_height = models.BigIntegerField(null=True, blank=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vote_ledger"
        indexes = [models.Index(fields=["vote_id"], name="idx_ledger_vote")]

    def __str__(self):  # pragma: no cover
        return f"ledger {self.ledger_id} → vote {self.vote_id}"

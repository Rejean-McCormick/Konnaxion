"""Expertise hierarchy (UNESCO ISCED-F)."""

from django.db import models
from django.contrib.postgres.fields import LTreeField


class ExpertiseCategory(models.Model):
    """
    Hierarchical expertise domain.

    * `code` – the official ISCED-F code (e.g. "0511").
    * `path` – Postgres ltree (“01.04.11”) for fast descendant queries.
    """

    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=128)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children",
    )
    depth = models.SmallIntegerField()
    path = LTreeField()

    class Meta:
        db_table = "expertise_category"
        indexes = [
            models.Index(fields=["depth", "code"], name="idx_cat_depth"),
            models.Index(fields=["path"], name="idx_cat_path", opclasses=["gist"]),
        ]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.code} • {self.name}"

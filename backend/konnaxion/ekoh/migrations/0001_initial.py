# FILE: backend/konnaxion/ekoh/migrations/0001_initial.py
"""
Initial Ekoh schema.

Creates:
- expertise_category
- user_expertise_score
- user_ethics_score
- score_configuration
- confidentiality_setting
- context_analysis_log
- score_history

Also ensures the PostgreSQL ltree extension is available so that
the ExpertiseCategory.path column can use the ltree type.
"""

from django.conf import settings
from django.contrib.postgres.operations import CreateExtension
from django.db import migrations, models


# Local copy of the LTreeField used in ekoh.models.taxonomy
class LTreeField(models.TextField):
    description = "PostgreSQL ltree field (ltree)"

    def db_type(self, connection):  # pragma: no cover
        return "ltree"


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Ensure ltree is available before creating tables that use it
        CreateExtension("ltree"),

        # ------------------------------------------------------------------ #
        # ExpertiseCategory                                                   #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="ExpertiseCategory",
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
                ("code", models.CharField(max_length=16, unique=True)),
                ("name", models.CharField(max_length=128)),
                (
                    "parent",
                    models.ForeignKey(
                        "self",
                        null=True,
                        blank=True,
                        on_delete=models.CASCADE,
                        related_name="children",
                    ),
                ),
                ("depth", models.SmallIntegerField()),
                ("path", LTreeField()),
            ],
            options={
                "db_table": "expertise_category",
                "indexes": [
                    models.Index(
                        fields=["depth", "code"],
                        name="idx_cat_depth",
                    ),
                    models.Index(
                        fields=["path"],
                        name="idx_cat_path",
                        opclasses=["gist"],
                    ),
                ],
            },
        ),

        # ------------------------------------------------------------------ #
        # ScoreConfiguration                                                  #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="ScoreConfiguration",
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
                ("weight_name", models.CharField(max_length=64)),
                ("weight_value", models.DecimalField(max_digits=6, decimal_places=3)),
                # Kept as non-nullable + blank=True to match models.config
                ("field", models.CharField(max_length=64, blank=True)),
            ],
            options={
                "db_table": "score_configuration",
                "unique_together": {("weight_name", "field")},
            },
        ),

        # ------------------------------------------------------------------ #
        # ConfidentialitySetting                                              #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="ConfidentialitySetting",
            fields=[
                (
                    "user",
                    models.OneToOneField(
                        on_delete=models.CASCADE,
                        primary_key=True,
                        serialize=False,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "level",
                    models.CharField(
                        max_length=16,
                        choices=[
                            ("public", "Public"),
                            ("pseudonym", "Pseudonym"),
                            ("anonymous", "Anonymous"),
                        ],
                        default="public",
                    ),
                ),
            ],
            options={
                "db_table": "confidentiality_setting",
            },
        ),

        # ------------------------------------------------------------------ #
        # UserEthicsScore                                                     #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="UserEthicsScore",
            fields=[
                (
                    "user",
                    models.OneToOneField(
                        on_delete=models.CASCADE,
                        primary_key=True,
                        serialize=False,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                ("ethical_score", models.DecimalField(max_digits=5, decimal_places=3)),
            ],
            options={
                "db_table": "user_ethics_score",
            },
        ),

        # ------------------------------------------------------------------ #
        # UserExpertiseScore                                                  #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="UserExpertiseScore",
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
                ("raw_score", models.DecimalField(max_digits=12, decimal_places=4)),
                (
                    "weighted_score",
                    models.DecimalField(max_digits=12, decimal_places=4),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        to="ekoh.expertisecategory",
                    ),
                ),
            ],
            options={
                "db_table": "user_expertise_score",
                "unique_together": {("user", "category")},
                "indexes": [
                    models.Index(
                        fields=["category", "-weighted_score"],
                        name="idx_score_top",
                        condition=models.Q(("weighted_score__gt", 0)),
                    ),
                ],
            },
        ),

        # ------------------------------------------------------------------ #
        # ContextAnalysisLog                                                  #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="ContextAnalysisLog",
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
                ("entity_type", models.CharField(max_length=64)),
                ("entity_id", models.UUIDField()),
                ("field", models.CharField(max_length=64, blank=True)),
                ("input_metadata", models.JSONField(null=True, blank=True)),
                ("adjustments_applied", models.JSONField(null=True, blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "context_analysis_log",
                "indexes": [
                    models.Index(
                        fields=["entity_type", "entity_id"],
                        name="context_ana_entity__5abedb_idx",
                    ),
                ],
            },
        ),

        # ------------------------------------------------------------------ #
        # ScoreHistory                                                        #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name="ScoreHistory",
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
                ("old_value", models.DecimalField(max_digits=12, decimal_places=4)),
                ("new_value", models.DecimalField(max_digits=12, decimal_places=4)),
                ("change_reason", models.TextField(blank=True)),
                ("changed_at", models.DateTimeField(auto_now_add=True)),
                (
                    "merit_score",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        to="ekoh.userexpertisescore",
                    ),
                ),
            ],
            options={
                "db_table": "score_history",
                "indexes": [
                    models.Index(
                        fields=["changed_at"],
                        name="score_histo_changed_cca210_idx",
                    ),
                ],
            },
        ),
    ]

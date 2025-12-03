"""
Adds consultation + consultation_relevance tables.

* Parent FK → expertise_category (Ekoh schema)
* Unique (consultation, category)
* BRIN-style index (consultation_id) for fast relevance look-ups
"""

from django.db import migrations, models
from decimal import Decimal


class Migration(migrations.Migration):
    dependencies = [
        ("smart_vote", "0001_initial"),   # parent partition migration
        ("ekoh", "0001_initial"),         # taxonomy table
    ]

    operations = [
        migrations.CreateModel(
            name="Consultation",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        primary_key=True,
                        serialize=False,
                        editable=False,
                    ),
                ),
                ("title", models.CharField(max_length=256)),
                ("opens_at", models.DateTimeField(blank=True, null=True)),
                ("closes_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"db_table": "consultation"},
        ),
        migrations.CreateModel(
            name="ConsultationRelevance",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "weight",
                    models.DecimalField(
                        max_digits=5,
                        decimal_places=4,
                        default=Decimal("0.0"),
                    ),
                ),
                ("criteria_json", models.JSONField(blank=True, null=True)),
                (
                    "category",
                    models.ForeignKey(
                        to="ekoh.expertisecategory",
                        on_delete=models.CASCADE,
                    ),
                ),
                (
                    "consultation",
                    models.ForeignKey(
                        to="smart_vote.consultation",
                        on_delete=models.CASCADE,
                    ),
                ),
            ],
            options={
                "db_table": "consultation_relevance",
                "unique_together": {("consultation", "category")},
                "indexes": [
                    models.Index(
                        fields=["consultation"],
                        name="idx_consult_relevance",
                    )
                ],
            },
        ),
    ]

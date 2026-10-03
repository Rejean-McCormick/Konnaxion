from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("ethikos", "0008_ik_subject_id_string")]

    operations = [
        migrations.AlterField(
            model_name="interactionemission",
            name="status",
            field=models.CharField(
                choices=[
                    ("queued", "Queued"),
                    ("sending", "Sending"),
                    ("delivered", "Delivered"),
                    ("accepted", "Accepted"),
                    ("succeeded", "Succeeded"),
                    ("failed", "Failed"),
                    ("retrying", "Retrying"),
                    ("dead", "Dead"),
                ],
                default="queued",
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name="interactionemission",
            name="last_retryable",
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="interactionemission",
            name="acceptance_receipt_json",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="interactionemission",
            name="final_receipt_json",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]

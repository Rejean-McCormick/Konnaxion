from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("ethikos", "0007_interaction_kernel_decisions")]

    operations = [
        migrations.AlterField(
            model_name="orgoimpactpublication",
            name="subject_id",
            field=models.CharField(max_length=500),
        ),
    ]

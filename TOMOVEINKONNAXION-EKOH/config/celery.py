import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("konnaxion-ekoh-smartvote")

# Load Celery config from Django settings, using the `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks in all installed Django apps.
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f"Celery debug: {self.request!r}")

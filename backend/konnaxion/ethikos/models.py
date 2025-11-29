# FILE: backend/konnaxion/ethikos/models.py
# konnaxion/ethikos/models.py
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

# ───────────────────────────────────────────────────
STANCE_MIN, STANCE_MAX = -3, 3
# ───────────────────────────────────────────────────

class EthikosCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return self.name


class EthikosTopic(models.Model):
    """One debate question."""
    OPEN, CLOSED, ARCHIVED = "open", "closed", "archived"
    STATUS_CHOICES = [
        (OPEN, "Open"),
        (CLOSED, "Closed"),
        (ARCHIVED, "Archived"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(
        EthikosCategory, on_delete=models.PROTECT, related_name="topics"
    )
    expertise_category = models.ForeignKey(
        "kollective_intelligence.ExpertiseCategory",
        null=True, blank=True, on_delete=models.SET_NULL,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ethikos_topics",
    )

    status = models.CharField(
        max_length=8,              # fits “archived”
        choices=STATUS_CHOICES,
        default=OPEN,
    )
    total_votes = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.title


class EthikosStance(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ethikos_stances",
    )
    topic = models.ForeignKey(
        EthikosTopic,
        on_delete=models.CASCADE,
        related_name="stances",
    )
    value = models.SmallIntegerField(
        validators=[
            MinValueValidator(STANCE_MIN),
            MaxValueValidator(STANCE_MAX),
        ]
    )
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "topic")
        indexes = [models.Index(fields=("topic",)), models.Index(fields=("user",))]
        constraints = [
            models.CheckConstraint(
                name="stance_value_between_-3_and_3",
                condition=models.Q(value__gte=STANCE_MIN, value__lte=STANCE_MAX),
            ),
        ]

    def __str__(self):
        return f"{self.user} → {self.topic} = {self.value}"


class EthikosArgument(models.Model):
    PRO, CON = "pro", "con"
    SIDE_CHOICES = [(PRO, "Pro"), (CON, "Con")]

    topic = models.ForeignKey(
        EthikosTopic, on_delete=models.CASCADE, related_name="arguments"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ethikos_arguments",
    )
    content = models.TextField()
    parent = models.ForeignKey(
        "self",
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    side = models.CharField(
        max_length=3, choices=SIDE_CHOICES, null=True, blank=True
    )
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=("topic",)), models.Index(fields=("user",))]
        ordering = ("created_at",)

    def __str__(self):
        return f"{self.user} on {self.topic}"

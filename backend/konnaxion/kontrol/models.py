# FILE: backend/konnaxion/kontrol/models.py
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from konnaxion.utils.models import TimeStampedModel  # Assuming a common utility


class AuditLog(TimeStampedModel):
    """
    Immutable record of administrative and system actions.
    """
    ACTOR_SYSTEM = "system"
    ACTOR_ADMIN = "admin"
    ACTOR_MODERATOR = "moderator"
    
    ROLE_CHOICES = (
        (ACTOR_SYSTEM, _("System")),
        (ACTOR_ADMIN, _("Admin")),
        (ACTOR_MODERATOR, _("Moderator")),
    )

    STATUS_SUCCESS = "success"
    STATUS_FAILURE = "failure"
    
    STATUS_CHOICES = (
        (STATUS_SUCCESS, _("Success")),
        (STATUS_FAILURE, _("Failure")),
    )

    # Actor information
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        help_text=_("User who performed the action. Null if system action."),
    )
    actor_name = models.CharField(
        max_length=255, 
        blank=True, 
        help_text=_("Snapshot of actor name or 'System'")
    )
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default=ACTOR_SYSTEM
    )
    
    # Action details
    action = models.CharField(max_length=255, help_text=_("e.g. DELETE_COMMENT, BAN_USER"))
    module = models.CharField(max_length=100, help_text=_("Target module e.g. Moderation, Auth"))
    target = models.CharField(max_length=255, help_text=_("Description of the target object"))
    
    # Request context
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default=STATUS_SUCCESS
    )
    
    # Optional metadata
    details = models.JSONField(
        default=dict, 
        blank=True, 
        help_text=_("Additional context like diffs or parameters")
    )

    class Meta:
        ordering = ["-created"]
        verbose_name = _("Audit Log")
        verbose_name_plural = _("Audit Logs")

    def __str__(self):
        return f"[{self.module}] {self.action} by {self.actor_name or 'System'}"


class ModerationTicket(TimeStampedModel):
    """
    A report or flagged item requiring moderator review.
    """
    SEVERITY_LOW = "low"
    SEVERITY_MEDIUM = "medium"
    SEVERITY_HIGH = "high"
    SEVERITY_CRITICAL = "critical"

    SEVERITY_CHOICES = (
        (SEVERITY_LOW, _("Low")),
        (SEVERITY_MEDIUM, _("Medium")),
        (SEVERITY_HIGH, _("High")),
        (SEVERITY_CRITICAL, _("Critical")),
    )

    STATUS_PENDING = "pending"
    STATUS_REVIEWED = "reviewed"
    STATUS_RESOLVED = "resolved"

    STATUS_CHOICES = (
        (STATUS_PENDING, _("Pending")),
        (STATUS_REVIEWED, _("Reviewed")),
        (STATUS_RESOLVED, _("Resolved")),
    )

    TYPE_COMMENT = "comment"
    TYPE_POST = "post"
    TYPE_USER_PROFILE = "user_profile"
    
    TYPE_CHOICES = (
        (TYPE_COMMENT, _("Comment")),
        (TYPE_POST, _("Post")),
        (TYPE_USER_PROFILE, _("User Profile")),
    )

    # Ticket info
    content_snippet = models.TextField(help_text=_("Short preview of the flagged content"))
    full_content = models.TextField(blank=True, help_text=_("Complete content for review"))
    
    # Related entities (Generic foreign keys could be used here, but keeping it simple for v14)
    target_id = models.CharField(max_length=255, help_text=_("ID of the reported object"))
    target_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    
    # People involved
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="moderation_tickets_authored",
        help_text=_("The user who created the flagged content")
    )
    author_reputation_score = models.IntegerField(default=0)
    
    # Report meta
    report_reason = models.CharField(max_length=255)
    report_count = models.PositiveIntegerField(default=1)
    severity = models.CharField(
        max_length=20, 
        choices=SEVERITY_CHOICES, 
        default=SEVERITY_MEDIUM
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default=STATUS_PENDING
    )
    
    # Resolution
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_tickets"
    )
    resolution_note = models.TextField(blank=True)

    class Meta:
        ordering = ["-severity", "-created"]
        verbose_name = _("Moderation Ticket")
        verbose_name_plural = _("Moderation Tickets")

    def __str__(self):
        return f"Ticket #{self.pk} - {self.report_reason} ({self.status})"
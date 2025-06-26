# konnaxion/konnected/models.py
from django.conf import settings
from django.db import models

class TimeStampedModel(models.Model):
    """Adds created_at / updated_at to every table."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

# ──────────────────────────────
#  CertifiKation sub-module
# ──────────────────────────────
class CertificationPath(TimeStampedModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    def __str__(self):
        return self.name

class Evaluation(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    path = models.ForeignKey(CertificationPath, on_delete=models.CASCADE)
    raw_score = models.FloatField()
    metadata = models.JSONField()
    def __str__(self):
        return f"{self.user} – {self.path} ({self.raw_score})"

class PeerValidation(TimeStampedModel):
    class Decision(models.TextChoices):
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE)
    peer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    decision = models.CharField(max_length=8, choices=Decision.choices)
    def __str__(self):
        return f"{self.peer} → {self.evaluation} [{self.decision}]"

class Portfolio(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    items = models.ManyToManyField('KnowledgeResource', blank=True, related_name='portfolios')
    def __str__(self):
        return self.title

class InteropMapping(TimeStampedModel):
    local_certification = models.ForeignKey(CertificationPath, on_delete=models.CASCADE)
    external_system = models.CharField(max_length=120)
    external_id = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.external_system}:{self.external_id}"

# ──────────────────────────────
#  Knowledge sub-module
# ──────────────────────────────
class KnowledgeResource(TimeStampedModel):
    class ResourceType(models.TextChoices):
        VIDEO = "video", "Video"
        DOC = "doc", "Document"
        COURSE = "course", "Course"
        OTHER = "other", "Other"
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=ResourceType.choices)
    url = models.URLField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    def __str__(self):
        return self.title

class KnowledgeRecommendation(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    resource = models.ForeignKey(KnowledgeResource, on_delete=models.CASCADE)
    recommended_at = models.DateTimeField()
    def __str__(self):
        return f"{self.user} ⇢ {self.resource}"

# ──────────────────────────────
#  Co-Creation sub-module
# ──────────────────────────────
class CoCreationProject(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=8, choices=Status.choices, default=Status.DRAFT)
    def __str__(self):
        return self.title

class CoCreationContribution(TimeStampedModel):
    project = models.ForeignKey(CoCreationProject, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    def __str__(self):
        return f"{self.user} → {self.project}"

# ──────────────────────────────
#  Forum sub-module
# ──────────────────────────────
class ForumTopic(TimeStampedModel):
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=120)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    def __str__(self):
        return self.title

class ForumPost(TimeStampedModel):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    def __str__(self):
        return f"{self.author} @ {self.topic}"

class LearningProgress(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    resource = models.ForeignKey(KnowledgeResource, on_delete=models.CASCADE)
    progress_percent = models.DecimalField(max_digits=5, decimal_places=2)
    class Meta:
        unique_together = ("user", "resource")  # each user/resource pair only once
    def __str__(self):
        return f"{self.user} – {self.resource} ({self.progress_percent}%)"

# FILE: backend/konnaxion/keenkonnect/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

from konnaxion.security_controls import validate_safe_external_url, validate_safe_upload, is_staff_or_superuser
from .school_access import is_school_project
from .models import Project, ProjectResource, ProjectTask, ProjectMessage, ProjectTeam, ProjectRating, Tag

# Exported classes for import elsewhere
__all__ = [
    "ProjectSerializer",
    "ProjectResourceSerializer",
    "ProjectTaskSerializer",
    "ProjectMessageSerializer",
    "ProjectTeamSerializer",
    "ProjectRatingSerializer",
    "TagSerializer",
]

class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for collaborative Project objects."""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if is_school_project(instance) and not is_staff_or_superuser(user):
            data["creator"] = "Responsable de classe"
        return data

    # Display creator username/string, read-only (set in view)
    creator = serializers.StringRelatedField(read_only=True)
    # We include tags as primary key list (many-to-many). They will appear as a list of tag IDs.
    # created_at and updated_at are auto timestamps, set read-only
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ("creator", "created_at", "updated_at")

class ProjectResourceSerializer(serializers.ModelSerializer):
    """Serializer for ProjectResource (documents/files linked to a project)."""
    # Show uploader as string, assign in view on create
    uploaded_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ProjectResource
        fields = "__all__"
        read_only_fields = ("id", "uploaded_by", "uploaded_at", "version", "converted_path")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if is_school_project(instance.project) and not is_staff_or_superuser(user):
            # Do not expose another pupil's account from a shared resource.
            data["uploaded_by"] = "Membre de l'équipe" if instance.uploaded_by_id else None
        return data

    def validate_external_url(self, value):
        return validate_safe_external_url(value) if value else value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        upload = attrs.get("file")
        file_type = attrs.get("file_type") or getattr(self.instance, "file_type", None)
        if upload:
            policies = {
                "image": ({".jpg", ".jpeg", ".png", ".gif", ".webp"}, {"image/jpeg", "image/png", "image/gif", "image/webp"}, 15),
                "document": ({".pdf", ".txt", ".csv", ".md"}, {"application/pdf", "text/plain", "text/csv", "text/markdown"}, 20),
                "3d_model": ({".glb", ".gltf", ".obj"}, {"model/gltf-binary", "model/gltf+json", "text/plain", "application/octet-stream"}, 50),
            }
            if file_type not in policies:
                raise serializers.ValidationError({"file": "File upload is not allowed for resource type 'other'."})
            extensions, mime_types, max_mib = policies[file_type]
            try:
                validate_safe_upload(upload, allowed_extensions=extensions, allowed_mime_types=mime_types, max_bytes=max_mib * 1024 * 1024)
            except serializers.ValidationError as exc:
                raise serializers.ValidationError({"file": exc.detail}) from exc
        if not upload and not attrs.get("external_url") and self.instance is None:
            raise serializers.ValidationError("Provide either a validated file or an HTTPS external_url.")
        return attrs

    def validate_project(self, value):
        # Moving a child between projects is not an ordinary edit: it can
        # circumvent the original project's owner/visibility checks.
        if self.instance is not None and value.pk != self.instance.project_id:
            raise serializers.ValidationError("Changing the parent project is forbidden.")
        return value

class ProjectTaskSerializer(serializers.ModelSerializer):
    """Serializer for a ProjectTask (to-do or milestone in a project)."""
    # Show assignee username if present
    assignee = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ProjectTask
        fields = "__all__"
        read_only_fields = ("id", "created_at")  # creator implicitly the project owner, created_at auto

    def validate_project(self, value):
        # Moving a child between projects is not an ordinary edit: it can
        # circumvent the original project's owner/visibility checks.
        if self.instance is not None and value.pk != self.instance.project_id:
            raise serializers.ValidationError("Changing the parent project is forbidden.")
        return value

SCHOOL_MESSAGE_CHOICES = frozenset({
    "J’ai besoin d’aide pour cette activité.",
    "Peux-tu m’expliquer la consigne ?",
    "Je peux aider mon équipe.",
    "Je souhaite demander une revue à mon enseignant.",
})


class ProjectMessageSerializer(serializers.ModelSerializer):
    """Serializer for a ProjectMessage (chat message in a project thread)."""
    # Show author username, assign in view
    author = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ProjectMessage
        fields = "__all__"
        read_only_fields = ("id", "author", "created_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if is_school_project(instance.project) and not is_staff_or_superuser(user):
            # A pupil can read allowed templates but not another pupil's login.
            data["author"] = "Moi" if getattr(user, "pk", None) == instance.author_id else "Membre de l'équipe"
        return data

    def validate_project(self, value):
        # Moving a child between projects is not an ordinary edit: it can
        # circumvent the original project's owner/visibility checks.
        if self.instance is not None and value.pk != self.instance.project_id:
            raise serializers.ValidationError("Changing the parent project is forbidden.")
        return value


    def validate(self, attrs):
        attrs = super().validate(attrs)
        project = attrs.get("project", getattr(self.instance, "project", None))
        if is_school_project(project):
            value = attrs.get("content", getattr(self.instance, "content", ""))
            if value not in SCHOOL_MESSAGE_CHOICES:
                raise serializers.ValidationError({"content": "Use an approved school message template."})
        return attrs
class ProjectTeamSerializer(serializers.ModelSerializer):
    """Serializer for ProjectTeam (project membership with role)."""

    user = serializers.StringRelatedField(read_only=True)
    project = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    project_id = serializers.IntegerField(read_only=True)
    project_title = serializers.CharField(source="project.title", read_only=True)
    # Explicit write-only fields are required: the public project/user fields
    # remain read-only and cannot be used for forged membership creation.
    project_ref = serializers.PrimaryKeyRelatedField(source="project", queryset=Project.objects.all(), write_only=True, required=False)
    user_ref = serializers.PrimaryKeyRelatedField(source="user", queryset=get_user_model().objects.all(), write_only=True, required=False)

    class Meta:
        model = ProjectTeam
        fields = "__all__"
        read_only_fields = (
            "id",
            "user",
            "user_id",
            "project",
            "project_id",
            "project_title",
            "joined_at",
        )

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if is_school_project(instance.project) and not is_staff_or_superuser(user):
            own = getattr(user, "pk", None) == instance.user_id
            data["user"] = "Moi" if own else "Membre de l'équipe"
            # No account ID or stable membership ID for peer enumeration.
            data.pop("user_id", None)
            if not own:
                data.pop("id", None)
        return data

    def validate_project_ref(self, value):
        # This alias maps to source="project"; validate under field name too.
        if self.instance is not None and value.pk != self.instance.project_id:
            raise serializers.ValidationError("Changing the membership project is forbidden.")
        return value

    def validate_user_ref(self, value):
        if self.instance is not None and value.pk != self.instance.user_id:
            raise serializers.ValidationError("Changing the membership account is forbidden.")
        return value

class ProjectRatingSerializer(serializers.ModelSerializer):
    """Serializer for ProjectRating (user rating/upvote on a project)."""
    # Show rater username, assign in view
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ProjectRating
        fields = "__all__"
        read_only_fields = ("id", "user", "created_at")

    def validate_project(self, value):
        # Moving a child between projects is not an ordinary edit: it can
        # circumvent the original project's owner/visibility checks.
        if self.instance is not None and value.pk != self.instance.project_id:
            raise serializers.ValidationError("Changing the parent project is forbidden.")
        return value

class TagSerializer(serializers.ModelSerializer):
    """Serializer for Tag (keyword) objects."""
    class Meta:
        model = Tag
        fields = "__all__"
        # All fields (id and name) are included; name is unique. No special read_only needed.

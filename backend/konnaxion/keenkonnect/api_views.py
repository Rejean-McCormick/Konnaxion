# FILE: backend/konnaxion/keenkonnect/api_views.py
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from konnaxion.security_controls import (
    OwnerOrStaffWritePermission,
    ProjectManagerWritePermission,
    SelfOrStaffWritePermission,
    StaffWritePublicReadPermission,
    user_can_manage_project,
    user_can_participate_project,
)

from .school_access import (
    SCHOOL_CATEGORY, is_school_project, visible_projects, visible_project_children,
)
from konnaxion.security_controls import is_staff_or_superuser

from .models import (
    Project,
    ProjectResource,
    ProjectTask,
    ProjectMessage,
    ProjectTeam,
    ProjectRating,
    Tag,
)
from .serializers import (
    ProjectSerializer,
    ProjectResourceSerializer,
    ProjectTaskSerializer,
    ProjectMessageSerializer,
    ProjectTeamSerializer,
    ProjectRatingSerializer,
    TagSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Projects (collaborative projects workspace).
    Provides list, retrieve, create, update, delete.
    Only authenticated users can create/update; read is open to all.
    """
    queryset = (
        Project.objects.select_related("creator")
        .prefetch_related("tags")
        .all()
    )
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, OwnerOrStaffWritePermission]
    owner_fields = ("creator",)
    # Use the model field name "creator" (DjangoFilterBackend will filter by ID)
    filterset_fields = ["status", "category", "creator"]

    def get_queryset(self):
        return visible_projects(super().get_queryset(), self.request.user)

    def perform_create(self, serializer):
        if str(serializer.validated_data.get("category", "")).casefold() == SCHOOL_CATEGORY and not is_staff_or_superuser(self.request.user):
            raise PermissionDenied("School project creation requires staff authorization.")
        serializer.save(creator=self.request.user)

    def perform_update(self, serializer):
        current = self.get_object()
        new_category = serializer.validated_data.get("category", current.category)
        if (is_school_project(current) or str(new_category).casefold() == SCHOOL_CATEGORY) and new_category != current.category:
            raise PermissionDenied("School project classification cannot be changed through the generic API.")
        serializer.save()


class ProjectResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectResource files/links attached to a project.
    Allows CRUD on project resources.
    Only authenticated users can upload/edit; anyone can read (if project is accessible).
    """
    queryset = (
        ProjectResource.objects.select_related("project", "uploaded_by")
        .all()
    )
    serializer_class = ProjectResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, ProjectManagerWritePermission]
    filterset_fields = ["project", "file_type"]

    def get_queryset(self):
        return visible_project_children(super().get_queryset(), self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if not user_can_manage_project(self.request.user, project):
            raise PermissionDenied("Project owner permission is required to add resources.")
        serializer.save(uploaded_by=self.request.user)


class ProjectTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectTask (tasks within a project).
    Allows managing tasks (CRUD) for projects.
    Only authenticated can modify; read is open.
    Supports filtering by project, status, assignee.
    """
    queryset = (
        ProjectTask.objects.select_related("project", "assignee")
        .all()
    )
    serializer_class = ProjectTaskSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, ProjectManagerWritePermission]
    filterset_fields = ["project", "status", "assignee"]

    def get_queryset(self):
        return visible_project_children(super().get_queryset(), self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if is_school_project(project):
            raise PermissionDenied("Orgo owns operational tasks for Ékole school projects.")
        if not user_can_manage_project(self.request.user, project):
            raise PermissionDenied("Project owner permission is required to add tasks.")
        serializer.save()

    def perform_update(self, serializer):
        if is_school_project(self.get_object().project):
            raise PermissionDenied("School task state is owned by Orgo.")
        serializer.save()

    def perform_destroy(self, instance):
        if is_school_project(instance.project):
            raise PermissionDenied("School task state is owned by Orgo.")
        instance.delete()


class ProjectMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectMessage (project chat messages).
    Allows sending and viewing messages in project discussion threads.
    Only authenticated users can create messages; read access is open to all by default.
    """
    queryset = (
        ProjectMessage.objects.select_related("project", "author")
        .order_by("created_at")
        .all()
    )
    serializer_class = ProjectMessageSerializer
    # If you want messages to be fully private, switch this to IsAuthenticated.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, OwnerOrStaffWritePermission]
    filterset_fields = ["project", "author"]

    def get_queryset(self):
        return visible_project_children(super().get_queryset(), self.request.user)

    owner_fields = ("author",)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if not user_can_participate_project(self.request.user, project):
            raise PermissionDenied("Project membership is required to post messages.")
        serializer.save(author=self.request.user)


class ProjectTeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectTeam (project team membership).
    Provides team membership list and management (add/remove members).
    Only authenticated can modify (e.g., add themselves or others to teams); read is open to view project teams.
    Filtering by project or user is supported.
    """
    queryset = (
        ProjectTeam.objects.select_related("project", "user")
        .all()
    )
    serializer_class = ProjectTeamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, ProjectManagerWritePermission]
    filterset_fields = ["project", "user", "role"]

    def get_queryset(self):
        return visible_project_children(super().get_queryset(), self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if not user_can_manage_project(self.request.user, project):
            raise PermissionDenied("Project manager authorization is required to add members.")
        serializer.save()

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="my-teams",
    )
    def my_teams(self, request):
        """
        Custom endpoint to list the current user's team memberships.
        Returns all ProjectTeam entries where user is the current user.
        """
        memberships = (
            ProjectTeam.objects.select_related("project", "user")
            .prefetch_related("project__team_memberships__user")
            .filter(user=request.user)
        )

        rows = []
        for membership in memberships:
            project_memberships = list(membership.project.team_memberships.all())
            preview = [
                {
                    "id": str(item.id),
                    "name": str(item.user),
                    "role": item.role,
                }
                for item in project_memberships[:3]
            ]

            # School memberships must not enumerate other children's usernames.
            school_scope = is_school_project(membership.project)
            if school_scope:
                preview = []

            role = (
                "owner"
                if membership.role == ProjectTeam.Role.OWNER
                else "member"
            )

            rows.append(
                {
                    "id": str(membership.id),
                    "name": membership.project.title,
                    "project_title": membership.project.title,
                    "membership_role": role,
                    "membership_status": "active",
                    "members_count": len(project_memberships),
                    "is_restricted": school_scope,
                    "recent_activity": [],
                    "members_preview": preview,
                }
            )

        return Response(rows)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated],
        url_path="leave",
    )
    def leave(self, request, pk=None):
        """Allow the current user to remove their own non-owner membership."""
        membership = self.get_object()

        if membership.user_id != request.user.id:
            return Response(
                {"detail": "You can only leave your own team membership."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if membership.role == ProjectTeam.Role.OWNER:
            return Response(
                {"detail": "Transfer project ownership before leaving."},
                status=status.HTTP_409_CONFLICT,
            )

        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectRatingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectRating (community ratings on projects).
    Users can upvote/downvote a project (value = +1 or -1).
    Each user can rate a project once (unique per project & user).
    Only authenticated users can create/modify ratings; read is open to see ratings.
    """
    queryset = (
        ProjectRating.objects.select_related("project", "user")
        .all()
    )
    serializer_class = ProjectRatingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, SelfOrStaffWritePermission]
    filterset_fields = ["project", "user"]

    def get_queryset(self):
        return visible_project_children(super().get_queryset(), self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data.get("project")
        if is_school_project(project):
            raise PermissionDenied("School projects do not expose public popularity voting.")
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if is_school_project(self.get_object().project):
            raise PermissionDenied("School projects do not expose public popularity voting.")
        serializer.save()

    def perform_destroy(self, instance):
        if is_school_project(instance.project):
            raise PermissionDenied("School projects do not expose public popularity voting.")
        instance.delete()


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tag objects (tags/keywords for projects and tasks).
    Allows listing all tags and creating new tags.
    Typically used for categorizing projects and tasks.
    """
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [StaffWritePublicReadPermission]
    filterset_fields = ["name"]
    # Allow searching/order tags by name
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name"]
    ordering = ["name"]

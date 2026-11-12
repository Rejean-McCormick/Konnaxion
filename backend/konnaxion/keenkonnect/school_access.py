"""Opt-in private school-project boundary for the existing keenKonnect API.

School projects are explicit: ``category == 'ekole.school'``.  Public legacy
projects keep their previous visibility.  This is not a World or identity
provider: authorization comes from the request's authenticated user plus
server-side Konnaxion project membership, never caller-supplied headers.
"""
from django.db.models import Q

from konnaxion.security_controls import is_staff_or_superuser

SCHOOL_CATEGORY = "ekole.school"


def is_school_project(project):
    return project is not None and str(getattr(project, "category", "") or "").casefold() == SCHOOL_CATEGORY


def visible_projects(queryset, user):
    """Exclude private school workspaces from anonymous and unrelated users."""
    if is_staff_or_superuser(user):
        return queryset
    outside_school = ~Q(category__iexact=SCHOOL_CATEGORY)
    if user is not None and getattr(user, "is_authenticated", False):
        return queryset.filter(
            outside_school | Q(creator_id=user.pk) | Q(team_memberships__user_id=user.pk)
        ).distinct()
    return queryset.filter(outside_school)


def visible_project_children(queryset, user):
    """Apply the same policy to messages, tasks, resources, teams and ratings."""
    if is_staff_or_superuser(user):
        return queryset
    outside_school = ~Q(project__category__iexact=SCHOOL_CATEGORY)
    if user is not None and getattr(user, "is_authenticated", False):
        return queryset.filter(
            outside_school | Q(project__creator_id=user.pk) |
            Q(project__team_memberships__user_id=user.pk)
        ).distinct()
    return queryset.filter(outside_school)

"""Compatibility imports for the canonical Ethikos API viewsets.

Historically this module contained a second, weaker set of CRUD viewsets.  The
router uses :mod:`konnaxion.ethikos.api_views`; keeping duplicate authorization
logic here is a security regression risk.  Import the canonical implementations
instead so every import path shares the same owner/moderator/admin policy.
"""

from .api_views import ArgumentViewSet, StanceViewSet, TopicViewSet

__all__ = ["TopicViewSet", "StanceViewSet", "ArgumentViewSet"]

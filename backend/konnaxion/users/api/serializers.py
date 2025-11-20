# backend/konnaxion/users/api/serializers.py

from __future__ import annotations

from urllib.parse import urlparse

from django.conf import settings
from rest_framework import serializers

from konnaxion.users.models import User


# Optional project-level override in settings.py:
# DEFAULT_AVATAR_PATH = "kreative/artworks/default_profile.png"
DEFAULT_AVATAR_PATH = getattr(
    settings, "DEFAULT_AVATAR_PATH", "kreative/artworks/default_profile.png"
)


def _is_absolute(url: str) -> bool:
    try:
        p = urlparse(url)
        return p.scheme in ("http", "https")
    except Exception:
        return False


def _join_media_url(path: str) -> str:
    """
    Join MEDIA_URL and a relative media path into a single URL string.
    Works whether MEDIA_URL is absolute (e.g. https://cdn/...) or relative (/media/).
    """
    base = (settings.MEDIA_URL or "/media/").rstrip("/")
    rel = path.lstrip("/")
    return f"{base}/{rel}"


class UserSerializer(serializers.ModelSerializer[User]):
    # Exposed to the frontend: absolute URL for the user's avatar (or default)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["username", "name", "url", "avatar_url"]
        extra_kwargs = {
            "url": {"view_name": "api:user-detail", "lookup_field": "username"},
        }

    def get_avatar_url(self, obj: User) -> str:
        """
        Rules:
        - If the User model has an ImageField `avatar` with a URL, use it.
          (If storage returns an absolute URL, return as-is.)
        - Else fall back to DEFAULT_AVATAR_PATH under MEDIA_URL.
        - If `request` is available, return an absolute URL for relative paths.
        """
        request = self.context.get("request")

        # Prefer a real uploaded avatar if present
        avatar = getattr(obj, "avatar", None)
        if avatar is not None and getattr(avatar, "url", None):
            url = avatar.url  # may already be absolute (e.g. S3)
            if _is_absolute(url):
                return url
            return request.build_absolute_uri(url) if request else url

        # Fallback: default image under MEDIA_URL
        fallback_rel = _join_media_url(DEFAULT_AVATAR_PATH)
        if _is_absolute(fallback_rel):
            # MEDIA_URL might be absolute (CDN)
            return fallback_rel
        return request.build_absolute_uri(fallback_rel) if request else fallback_rel

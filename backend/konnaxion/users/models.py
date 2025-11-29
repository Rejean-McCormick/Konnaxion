# FILE: backend/konnaxion/users/models.py
import os

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import CharField
from django.urls import reverse
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _


def user_avatar_upload_to(instance, filename: str) -> str:
    """
    Storage path for user avatar uploads.

    Pattern:
        users/<user_id>/avatar/<slugified-filename><ext>
    """
    name, ext = os.path.splitext(filename)
    safe_name = slugify(name) or "avatar"
    # For new users without pk, this will use "new" once; normally avatars are set post-signup.
    user_id = instance.pk or "new"
    return f"users/{user_id}/avatar/{safe_name}{ext}"


class User(AbstractUser):
    """
    Default custom user model for Konnaxion.
    If adding fields that need to be filled at user signup,
    check forms.SignupForm and forms.SocialSignupForms accordingly.
    """

    # First and last name do not cover name patterns around the globe
    name = CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore[assignment]
    last_name = None  # type: ignore[assignment]

    # Binary avatar image uploaded by the user
    avatar = models.ImageField(
        upload_to=user_avatar_upload_to,
        blank=True,
        null=True,
        help_text="User-uploaded avatar image.",
    )

    # Chosen artwork used as this user's profile picture
    profile_artwork = models.ForeignKey(
        "kreative.KreativeArtwork",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users_using_as_profile",
    )

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})

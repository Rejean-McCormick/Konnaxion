"""Privacy-aware EkoH profile endpoint."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny

from konnaxion.ekoh.models.privacy import ConfidentialitySetting
from konnaxion.ekoh.serializers.profile import ProfileSerializer

User = get_user_model()


class ProfileView(RetrieveAPIView):
    """Return an EkoH context profile subject to its visibility setting.

    Public and pseudonymous profiles may be read publicly.  Anonymous profiles
    are visible only to the subject or staff.  This endpoint does not expose a
    global Smart Vote weight because such a weight only exists for a declared
    consultation/lens.
    """

    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "uid"

    def get_queryset(self):
        return ProfileSerializer.setup_eager_loading(User.objects.all())

    def get_object(self):
        uid = self.kwargs.get(self.lookup_url_kwarg)
        user = get_object_or_404(self.get_queryset(), pk=uid)
        setting = getattr(user, "confidentialitysetting", None)
        level = setting.level if setting else ConfidentialitySetting.PUBLIC

        requester = self.request.user
        is_self = bool(
            getattr(requester, "is_authenticated", False)
            and requester.pk == user.pk
        )
        is_staff = bool(
            getattr(requester, "is_authenticated", False)
            and getattr(requester, "is_staff", False)
        )

        if level == ConfidentialitySetting.ANONYMOUS and not (is_self or is_staff):
            # Do not disclose that a private/anonymous profile exists.
            raise NotFound()

        self.check_object_permissions(self.request, user)
        return user

"""
GET /ekoh/profile/<uid>

Returns the public expertise & ethics profile for a single user.
"""

from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from konnaxion.ekoh.serializers.profile import ProfileSerializer

User = get_user_model()


class ProfileView(RetrieveAPIView):
    """
    Public endpoint – no auth required if the target user’s
    confidentiality level is `public` or `pseudonym`.
    """

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_url_kwarg = "uid"

    def get_queryset(self):
        """
        Optimise by pulling related privacy & ethics records
        in one DB round-trip.
        """
        qs = User.objects.all()
        return ProfileSerializer.setup_eager_loading(qs)

    def get_object(self):
        uid = self.kwargs.get(self.lookup_url_kwarg)
        return get_object_or_404(self.get_queryset(), pk=uid)

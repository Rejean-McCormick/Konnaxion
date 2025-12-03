"""
Smart-Vote route entrypoint.

Add to project urls.py:

    path("api/v1/smart-vote/", include("konnaxion.smart_vote.urls"))
"""

from django.urls import path
from konnaxion.smart_vote.views.cast import CastBallotView

app_name = "smart_vote"

urlpatterns = [
    path("cast/", CastBallotView.as_view(), name="cast"),
]

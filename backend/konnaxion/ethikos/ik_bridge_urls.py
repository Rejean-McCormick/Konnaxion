from django.urls import path
from .ik_bridge_views import ik_interaction_ingress

urlpatterns = [path("interactions/", ik_interaction_ingress, name="ik-interactions")]

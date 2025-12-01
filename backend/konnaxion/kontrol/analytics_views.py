# FILE: backend/konnaxion/kontrol/analytics_views.py
import math
import random
from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from konnaxion.kontrol.views import IsAdminOrModerator


class UsageReportView(APIView):
    """
    Returns aggregated usage data for the platform.
    Endpoint: /api/reports/usage?range=30d
    """
    permission_classes = [IsAdminOrModerator]

    def get(self, request):
        range_key = request.query_params.get("range", "30d")
        days = 30
        if range_key == "7d":
            days = 7
        elif range_key == "90d":
            days = 90

        # Mock Data Generation (Mirroring frontend logic for now)
        # In a real implementation, this would aggregate from UserLogin logs or similar.
        points = []
        today = timezone.now().date()
        
        for i in range(days - 1, -1, -1):
            date = today - timedelta(days=i)
            # Generate somewhat realistic fluctuating data
            base = 200 + (i % 10) * 15
            active_users = base + int(random.random() * 80)
            new_users = 20 + int(random.random() * 15)
            sessions = int(active_users * (1.2 + random.random() * 0.8))
            
            points.append({
                "label": date.isoformat(),
                "activeUsers": active_users,
                "newUsers": new_users,
                "sessions": sessions,
            })

        # Mock Module Breakdown
        last_active = points[-1]["activeUsers"]
        modules = [
            {
                "key": "ekoh",
                "module": "Ekoh · Collective reputation",
                "activeUsers": int(last_active * 0.65),
                "avgSessionMinutes": 9.4,
                "retentionRate": 82,
                "lastActive": points[-1]["label"],
            },
            {
                "key": "ethikos",
                "module": "Ethikos · Deliberation & ethics",
                "activeUsers": int(last_active * 0.54),
                "avgSessionMinutes": 12.1,
                "retentionRate": 76,
                "lastActive": points[-1]["label"],
            },
            # Add other modules similarly...
        ]

        data = {
            "generatedAt": timezone.now().isoformat(),
            "points": points,
            "modules": modules,
        }
        return Response(data, status=status.HTTP_200_OK)


class PerformanceReportView(APIView):
    """
    Returns system performance metrics (latency, errors).
    Endpoint: /api/reports/perf?range=24h
    """
    permission_classes = [IsAdminOrModerator]

    def get(self, request):
        range_key = request.query_params.get("range", "24h")
        
        # Mock Data Structure for Perf
        # In reality, query Prometheus or a time-series DB
        data = {
            "summary": {
                "p95LatencyMs": 320,
                "p99LatencyMs": 780,
                "errorRatePct": 0.8,
                "throughputRps": 420,
                "apdex": 0.93,
                "uptimePct": 99.85,
            },
            # Mock series data would be generated based on range_key here
            "latencySeries": [], 
            "errorSeries": []
        }
        
        return Response(data, status=status.HTTP_200_OK)
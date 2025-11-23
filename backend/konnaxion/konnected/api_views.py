# konnaxion/konnected/api_views.py
from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    CertificationPath,
    Evaluation,
    KnowledgeResource,
    PeerValidation,
    Portfolio,
)
from .serializers import (
    CertificationPathSerializer,
    EvaluationSerializer,
    ExamAttemptSerializer,
    KnowledgeResourceSerializer,
    PeerValidationSerializer,
    PortfolioSerializer,
)

# ---------------------------------------------------------------------------
# Global parameters – aligned with v14 Global Parameter Reference
# ---------------------------------------------------------------------------

CERT_PASS_PERCENT: int = getattr(settings, "CERT_PASS_PERCENT", 80)
QUIZ_RETRY_COOLDOWN_MIN: int = getattr(settings, "QUIZ_RETRY_COOLDOWN_MIN", 30)


class KnowledgeResourceViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for KonnectED knowledge-library items
    (video, document, course, other).

    The model follows v14 spec:
        id, title, type, url, author, created_at, updated_at
    """
    queryset = KnowledgeResource.objects.select_related("author")
    serializer_class = KnowledgeResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Record the authenticated user as the author
        serializer.save(author=self.request.user)


# ---------------------------------------------------------------------------
#  CertifiKation – Certification paths + exam attempts
# ---------------------------------------------------------------------------


class CertificationPathViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for certification / learning paths.

    Base routes (mounted under /api/):

        GET  /konnected/certifications/paths/
        POST /konnected/certifications/paths/
        GET  /konnected/certifications/paths/{id}/
        ...

    Extra actions (for Exam Registration page):

        GET /konnected/certifications/paths/{id}/eligibility/
        GET /konnected/certifications/paths/{id}/sessions/
    """
    queryset = CertificationPath.objects.all().order_by("name")
    serializer_class = CertificationPathSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(
        detail=True,
        methods=["get"],
        url_path="eligibility",
        permission_classes=[permissions.IsAuthenticated],
    )
    def eligibility(self, request, pk=None):
        """
        Returns a simple eligibility view for this certification path.

        Response shape matches ExamEligibility in the frontend:
            { "already_passed": bool, "cooldown_remaining_minutes": number }
        """
        path = self.get_object()
        user = request.user

        evaluations = (
            Evaluation.objects.filter(user=user, path=path)
            .order_by("-created_at")
        )

        already_passed = False
        cooldown_remaining = 0

        last_eval = evaluations.first()
        if last_eval is not None:
            score = last_eval.raw_score
            metadata = last_eval.metadata or {}
            pass_threshold = metadata.get("pass_percent", CERT_PASS_PERCENT)

            if score is not None and score >= pass_threshold:
                already_passed = True
            else:
                # Respect retry cooldown from the last attempt
                delta_minutes = (timezone.now() - last_eval.created_at).total_seconds() / 60.0
                if delta_minutes < QUIZ_RETRY_COOLDOWN_MIN:
                    cooldown_remaining = int(
                        max(0, round(QUIZ_RETRY_COOLDOWN_MIN - delta_minutes))
                    )

        return Response(
            {
                "already_passed": already_passed,
                "cooldown_remaining_minutes": cooldown_remaining,
            }
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="sessions",
        permission_classes=[permissions.IsAuthenticated],
    )
    def sessions(self, request, pk=None):
        """
        Returns upcoming exam sessions for this certification path.

        v14 does not yet define a persistent ExamSession model, so this
        implementation returns a small synthetic schedule based on the
        current time. You can replace this with real DB-backed sessions
        later without changing the endpoint contract.
        """
        now = timezone.now()
        base_start = now + timedelta(days=3)

        sessions = []
        for index in range(3):
            start = base_start + timedelta(days=7 * index)
            end = start + timedelta(hours=2)
            sessions.append(
                {
                    "id": index + 1,
                    "start_at": start.isoformat(),
                    "end_at": end.isoformat(),
                    "timezone": "UTC",
                    "modality": "online",
                    "location": "Remote proctored",
                    "capacity": 25,
                    "seats_remaining": 25,
                    "registration_deadline": (start - timedelta(days=1)).isoformat(),
                }
            )

        return Response(sessions)


class EvaluationViewSet(viewsets.ModelViewSet):
    """
    Stores exam / assessment attempts for certification paths.

    Base routes (mounted under /api/):

        GET  /konnected/certifications/evaluations/
        POST /konnected/certifications/evaluations/
        GET  /konnected/certifications/evaluations/{id}/
        ...

    The queryset is always scoped to the authenticated user.
    """
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Evaluation.objects.none()
        return (
            Evaluation.objects.filter(user=user)
            .select_related("path", "user")
            .order_by("-created_at")
        )

    def create(self, request, *args, **kwargs):
        """
        Custom create to map the Exam Registration payload into the model.

        The frontend (Exam Registration page) typically POSTs:

            {
              "path_id":        number,
              "session_id":     number,
              "full_name":      string,
              "agreed_terms":   boolean
            }

        We map:
            - user  ← request.user
            - path  ← CertificationPath(path_id)
            - raw_score ← 0.0 (exam not taken yet)
            - metadata ← remaining booking details
        """
        user = request.user
        data = request.data

        path_id = data.get("path_id")
        if not path_id:
            return Response(
                {"detail": "path_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            path = CertificationPath.objects.get(pk=path_id)
        except CertificationPath.DoesNotExist:
            return Response(
                {"detail": "Unknown certification path."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        metadata = {
            "session_id": data.get("session_id"),
            "full_name": data.get("full_name"),
            "agreed_terms": data.get("agreed_terms"),
            # Reasonable defaults that the dashboard can later read/override
            "delivery_mode": "online",
            "proctored": True,
            "status": "scheduled",
        }

        evaluation = Evaluation.objects.create(
            user=user,
            path=path,
            raw_score=0.0,
            metadata=metadata,
        )

        serializer = self.get_serializer(evaluation)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PeerValidationViewSet(viewsets.ModelViewSet):
    """
    API for peer mentors to record validation decisions on evaluations.
    """
    serializer_class = PeerValidationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PeerValidation.objects.none()
        if user.is_staff:
            return PeerValidation.objects.all().select_related("evaluation", "peer")
        return PeerValidation.objects.filter(peer=user).select_related("evaluation", "peer")

    def perform_create(self, serializer):
        serializer.save(peer=self.request.user)


class PortfolioViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for user skill portfolios (collections of KnowledgeResources).
    """
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Portfolio.objects.none()
        return Portfolio.objects.filter(user=user).prefetch_related("items")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExamAttemptViewSet(viewsets.ViewSet):
    """
    Read-only endpoints backing the Exam Dashboard UI.

    This ViewSet does not map to a single model; instead it aggregates
    Evaluation + PeerValidation (and, optionally, certificates/portfolio)
    into ExamAttemptSerializer records.

    Mounted under /api/ as:

        GET /konnected/certifications/exam-attempts/
        GET /konnected/certifications/exam-attempts/me/
        GET /konnected/certifications/exam-attempts/{id}/
        POST /konnected/certifications/exam-attempts/{id}/appeal/
        POST /konnected/certifications/exam-attempts/{id}/retry/
    """
    permission_classes = [permissions.IsAuthenticated]

    def _build_attempt(self, evaluation: Evaluation, attempt_number: int) -> dict:
        metadata = evaluation.metadata or {}
        path = evaluation.path

        score_percent = metadata.get("score_percent")
        if score_percent is None and evaluation.raw_score is not None:
            score_percent = float(evaluation.raw_score)

        max_score = metadata.get("max_score")
        delivery_mode = metadata.get("delivery_mode", "online")
        proctored = bool(metadata.get("proctored", False))

        # Use per-evaluation pass threshold if present
        pass_threshold = metadata.get("pass_percent", CERT_PASS_PERCENT)

        status_value = metadata.get("status")
        if not status_value:
            # Derive a simple status when none is explicitly stored
            if score_percent is None or score_percent == 0:
                status_value = "scheduled"
            elif score_percent >= pass_threshold:
                status_value = "passed"
            else:
                status_value = "failed"

        peer_required = bool(metadata.get("peer_validation_required", False))

        peer_status = None
        if peer_required:
            peer_qs = PeerValidation.objects.filter(evaluation=evaluation)
            decisions = {pv.decision for pv in peer_qs}
            if "approved" in decisions:
                peer_status = "approved"
            elif "rejected" in decisions:
                peer_status = "rejected"
            elif decisions:
                peer_status = "pending"
            else:
                peer_status = "pending"

        appeal_status = metadata.get("appeal_status", "none")

        cooldown_delta = timedelta(minutes=QUIZ_RETRY_COOLDOWN_MIN)
        next_retry_at = evaluation.created_at + cooldown_delta
        now = timezone.now()
        can_retry = status_value != "passed" and now >= next_retry_at

        certificate_id = metadata.get("certificate_id")
        certificate_url = metadata.get("certificate_url")
        portfolio_item_id = metadata.get("portfolio_item_id")
        portfolio_url = metadata.get("portfolio_url")

        return {
            "id": str(evaluation.pk),
            "certificationPathId": str(path.pk),
            "certificationPathName": path.name,
            "attemptNumber": attempt_number,
            "takenAt": evaluation.created_at,
            "deliveryMode": delivery_mode,
            "proctored": proctored,
            "scorePercent": score_percent,
            "maxScore": max_score,
            "status": status_value,
            "peerValidationRequired": peer_required,
            "peerValidationStatus": peer_status,
            "appealStatus": appeal_status,
            "certificateId": certificate_id,
            "certificateUrl": certificate_url,
            "portfolioItemId": portfolio_item_id,
            "portfolioUrl": portfolio_url,
            "canRetry": can_retry,
            # Only expose a concrete nextRetryAt while cooldown is active
            "nextRetryAt": None if can_retry else next_retry_at,
        }

    def list(self, request):
        """
        Alias for `me()` – global listing of attempts for the current user.
        """
        return self.me(request)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """
        Returns all exam attempts for the authenticated user across paths.

        Response shape matches the ExamDashboard `ExamAttemptsResponse`:
            { "attempts": ExamAttempt[] }
        """
        user = request.user
        evaluations = (
            Evaluation.objects.filter(user=user)
            .select_related("path")
            .order_by("path_id", "created_at", "pk")
        )

        attempts_payload = []
        attempt_counter_by_path: dict[int, int] = {}

        for evaluation in evaluations:
            path_id = evaluation.path_id
            attempt_counter_by_path[path_id] = attempt_counter_by_path.get(path_id, 0) + 1
            attempt_number = attempt_counter_by_path[path_id]
            attempts_payload.append(self._build_attempt(evaluation, attempt_number))

        serializer = ExamAttemptSerializer(attempts_payload, many=True)
        return Response({"attempts": serializer.data})

    def retrieve(self, request, pk=None):
        """
        Detailed view of a single exam attempt belonging to the current user.
        """
        user = request.user
        try:
            evaluation = (
                Evaluation.objects.select_related("path")
                .get(pk=pk, user=user)
            )
        except Evaluation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Compute attempt number within this path
        ordered = (
            Evaluation.objects.filter(user=user, path=evaluation.path)
            .order_by("created_at", "pk")
        )
        attempt_number = 1
        for idx, ev in enumerate(ordered, start=1):
            if ev.pk == evaluation.pk:
                attempt_number = idx
                break

        payload = self._build_attempt(evaluation, attempt_number)
        serializer = ExamAttemptSerializer(payload)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="appeal")
    def appeal(self, request, pk=None):
        """
        Lightweight stub for opening an appeal on an evaluation.

        For v14 we simply mark the evaluation's metadata and return
        the updated attempt. A richer workflow (notifications, tasks)
        can be layered on top later.
        """
        try:
            evaluation = Evaluation.objects.get(pk=pk, user=request.user)
        except Evaluation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        metadata = evaluation.metadata or {}
        metadata["appeal_status"] = "open"
        evaluation.metadata = metadata
        evaluation.save(update_fields=["metadata", "updated_at"])

        return self.retrieve(request, pk=pk)

    @action(detail=True, methods=["post"], url_path="retry")
    def retry(self, request, pk=None):
        """
        Helper that creates a new scheduled Evaluation for the same path,
        subject to the configured cooldown.

        This is used by the Exam Dashboard "Retry" action.
        """
        try:
            source_eval = (
                Evaluation.objects.select_related("path")
                .get(pk=pk, user=request.user)
            )
        except Evaluation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        metadata = source_eval.metadata or {}

        # Compute score_percent and pass threshold to determine if the exam is already passed
        score_percent = metadata.get("score_percent")
        if score_percent is None and source_eval.raw_score is not None:
            score_percent = float(source_eval.raw_score)
        pass_threshold = metadata.get("pass_percent", CERT_PASS_PERCENT)

        if score_percent is not None and score_percent >= pass_threshold:
            return Response(
                {"detail": "You cannot retry an exam that has already been passed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cooldown_delta = timedelta(minutes=QUIZ_RETRY_COOLDOWN_MIN)
        if timezone.now() < source_eval.created_at + cooldown_delta:
            return Response(
                {"detail": "Retry cooldown is still active for this exam."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        base_metadata = metadata
        new_metadata = {
            **base_metadata,
            "status": "scheduled",
            "is_retry": True,
        }

        new_eval = Evaluation.objects.create(
            user=request.user,
            path=source_eval.path,
            raw_score=0.0,
            metadata=new_metadata,
        )

        # Compute attempt number for the newly created evaluation
        ordered = (
            Evaluation.objects.filter(user=request.user, path=source_eval.path)
            .order_by("created_at", "pk")
        )
        attempt_number = 1
        for idx, ev in enumerate(ordered, start=1):
            if ev.pk == new_eval.pk:
                attempt_number = idx
                break

        payload = self._build_attempt(new_eval, attempt_number)
        serializer = ExamAttemptSerializer(payload)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

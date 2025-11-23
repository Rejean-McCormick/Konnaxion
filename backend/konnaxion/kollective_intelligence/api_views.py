from rest_framework import viewsets, permissions, serializers, parsers
from rest_framework.response import Response
from django.utils import timezone
from .models import Credential  # The Django model for user credentials

class CredentialSerializer(serializers.ModelSerializer):
    # Map model fields to desired output keys (camelCase where needed)
    issuedAt = serializers.DateTimeField(source='issued_at', required=False)
    url = serializers.SerializerMethodField()
    file = serializers.FileField(write_only=True, required=True)  # file is for upload only

    class Meta:
        model = Credential
        fields = ['id', 'title', 'issuer', 'issuedAt', 'url', 'status', 'notes', 'file']
        read_only_fields = ['id', 'status', 'notes', 'url']
    
    def get_url(self, obj):
        # Return the full URL to the uploaded file, if available
        request = self.context.get('request')
        if obj.file:
            # build_absolute_uri will include domain if request is present
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None

    def create(self, validated_data):
        # Extract and remove write_only fields
        file = validated_data.pop('file')
        title = validated_data.get('title')
        issuer = validated_data.get('issuer', '')
        issued_at = validated_data.get('issued_at')
        # Derive title from filename if not provided
        if not title:
            fname = file.name
            # Remove extension and replace underscores/dashes with spaces
            title_base = fname.rsplit('.', 1)[0]
            title_base = title_base.replace('_', ' ').replace('-', ' ').strip()
            title = title_base or "Untitled credential"
        # If no issued_at provided, we can leave it null or use current date
        if not issued_at:
            issued_at = None
        # Create Credential instance with Pending status and initial notes
        credential = Credential.objects.create(
            user=self.context['request'].user,
            title=title,
            issuer=issuer or "",
            issued_at=issued_at,
            file=file,
            status="Pending",
            notes="Awaiting manual verification"
        )
        return credential

class CredentialViewSet(viewsets.ModelViewSet):
    """
    API endpoints for user credentials in the trust system.
    Supports:
      - GET /api/trust/credentials/ : List current user's credentials
      - POST /api/trust/credentials/ : Upload a new credential (file + metadata)
    """
    serializer_class = CredentialSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]  # enable file uploads

    def get_queryset(self):
        user = self.request.user
        # Only return credentials belonging to the authenticated user (or none if not auth)
        if not user.is_authenticated:
            return Credential.objects.none()
        return Credential.objects.filter(user=user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        # Wrap the list in an "items" key to match frontend expectation:contentReference[oaicite:29]{index=29}
        return Response({ "items": serializer.data })

    # (The create() action is handled by ModelViewSet using our serializer.create)
    # We allow retrieve/update/delete for completeness, but these can be restricted if needed.

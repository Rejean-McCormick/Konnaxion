from __future__ import annotations

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.serializers import ValidationError

from konnaxion.security_controls import validate_safe_external_url, validate_safe_upload


def test_external_url_requires_https(settings):
    settings.KONNAXION_EXTERNAL_LINK_ALLOWED_HOSTS = []
    with pytest.raises(ValidationError):
        validate_safe_external_url("http://example.com/path")


def test_external_url_rejects_private_ip(settings):
    settings.KONNAXION_EXTERNAL_LINK_ALLOWED_HOSTS = []
    with pytest.raises(ValidationError):
        validate_safe_external_url("https://127.0.0.1/admin")


def test_external_url_accepts_public_https(settings):
    settings.KONNAXION_EXTERNAL_LINK_ALLOWED_HOSTS = []
    assert validate_safe_external_url("https://example.com/resource") == "https://example.com/resource"


def test_upload_rejects_html_even_with_safe_extension():
    upload = SimpleUploadedFile("photo.jpg", b"<!doctype html><script>alert(1)</script>", content_type="image/jpeg")
    with pytest.raises(ValidationError):
        validate_safe_upload(upload, allowed_extensions={".jpg"}, allowed_mime_types={"image/jpeg"})


def test_upload_rejects_active_extension():
    upload = SimpleUploadedFile("payload.svg", b"<svg></svg>", content_type="image/svg+xml")
    with pytest.raises(ValidationError):
        validate_safe_upload(upload)

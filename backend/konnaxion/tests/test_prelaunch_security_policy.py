from __future__ import annotations

import ssl

from django.conf import settings

from config.protected_media import _normalize_media_path
from konnaxion.integrations.interaction_kernel.transport import _validated_target_url


def test_world_media_path_normalization_rejects_parent_traversal():
    from django.http import Http404

    try:
        _normalize_media_path("worlds/1/releases/2/../../secret")
    except Http404:
        pass
    else:
        raise AssertionError("parent traversal must be rejected")


def test_world_media_path_normalization_canonicalizes_slashes():
    assert _normalize_media_path("/worlds/1/releases/2/images/a.jpg") == "worlds/1/releases/2/images/a.jpg"


def test_interaction_kernel_target_requires_https(settings):
    settings.DEBUG = False
    assert _validated_target_url("http://example.com/ik") == ""
    assert _validated_target_url("https://example.com/ik") == "https://example.com/ik"


def test_redis_tls_verifies_certificates():
    if settings.REDIS_SSL:
        assert settings.CELERY_BROKER_USE_SSL["ssl_cert_reqs"] == ssl.CERT_REQUIRED


def test_production_allauth_trusts_exactly_one_proxy_hop():
    from pathlib import Path

    production_source = (
        Path(__file__).resolve().parents[2] / "config" / "settings" / "production.py"
    ).read_text(encoding="utf-8")
    assert "ALLAUTH_TRUSTED_PROXY_COUNT = 1" in production_source
    assert '"IGNORE_EXCEPTIONS": False' in production_source


def test_protected_media_kreative_artwork_requires_authenticated_user():
    from types import SimpleNamespace
    from django.http import Http404
    from config import protected_media

    request = SimpleNamespace(user=SimpleNamespace(is_authenticated=False))
    try:
        protected_media._authorize_kreative_world_media(
            request,
            "worlds/1/releases/1/kreative/artworks/2/new/x.jpg",
            "kreative/artworks/2/new/x.jpg",
        )
    except Http404:
        pass
    else:
        raise AssertionError("anonymous artwork media access must fail closed")

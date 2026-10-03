from __future__ import annotations

import mimetypes
import re
from pathlib import PurePosixPath

from django.conf import settings
from django.core.files.storage import default_storage
from django.http import FileResponse, Http404, HttpRequest, HttpResponse
from django.views.decorators.http import require_http_methods

_WORLD_MEDIA_RE = re.compile(
    r"^worlds/(?P<world_id>[1-9][0-9]*)/releases/(?P<release_id>[1-9][0-9]*)/(?P<rest>.+)$"
)
_TRUST_CREDENTIAL_RE = re.compile(
    r"^trust/credentials/[0-9]{4}/[0-9]{2}/user-(?P<user_id>[1-9][0-9]*)/(?P<rest>.+)$"
)
_BLOCKED_SUFFIXES = {
    ".htm",
    ".html",
    ".xhtml",
    ".svg",
    ".xml",
    ".js",
    ".mjs",
    ".hta",
    ".wasm",
}


def _normalize_media_path(value: str) -> str:
    raw = str(value or "").replace("\\", "/").strip("/")
    path = PurePosixPath(raw)
    parts = tuple(part for part in path.parts if part not in ("", "."))
    if not parts or any(part == ".." for part in parts):
        raise Http404
    return "/".join(parts)


def _authorize_kreative_world_media(request: HttpRequest, path: str, rest: str) -> None:
    """Apply product-level privacy on top of the World access boundary."""
    user = getattr(request, "user", None)

    if rest.startswith("kreative/artworks/"):
        # Artwork API reads are members-only. World visibility alone must not
        # make the underlying file public through /media/.
        if not user or not getattr(user, "is_authenticated", False):
            raise Http404
        from konnaxion.kreative.models import KreativeArtwork

        if not KreativeArtwork.objects.filter(media_file=path).exists():
            raise Http404
        return

    if rest.startswith("kreative/traditions/"):
        # Approved traditions are readable according to the World boundary.
        # Pending submissions remain visible only to submitter/staff.
        from konnaxion.kreative.models import TraditionEntry

        entry = (
            TraditionEntry.objects.only("approved", "submitted_by_id")
            .filter(media_file=path)
            .first()
        )
        if entry is None:
            raise Http404
        if entry.approved:
            return
        if not user or not getattr(user, "is_authenticated", False):
            raise Http404
        if not (
            getattr(user, "is_staff", False)
            or getattr(user, "is_superuser", False)
            or getattr(user, "pk", None) == entry.submitted_by_id
        ):
            raise Http404


def _authorize_world_media(request: HttpRequest, path: str) -> bool:
    match = _WORLD_MEDIA_RE.fullmatch(path)
    if not match:
        return False

    # Imported lazily so config.url loading remains compatible with the sibling
    # Konnaxion_Worlds package lifecycle.
    from konnaxion.worlds.models import World, WorldRelease
    from konnaxion.worlds.resolver import can_access_world

    world_id = int(match.group("world_id"))
    release_id = int(match.group("release_id"))
    try:
        world = World.objects.select_related("universe").get(pk=world_id)
    except World.DoesNotExist as exc:
        raise Http404 from exc

    # A path claiming a release from a different World must never resolve.
    if not WorldRelease.objects.filter(pk=release_id, world_id=world_id).exists():
        raise Http404
    if not can_access_world(request.user, world):
        # Hide existence of private Worlds/media from unauthorized callers.
        raise Http404

    _authorize_kreative_world_media(request, path, match.group("rest"))
    return True


def _authorize_trust_credential(request: HttpRequest, path: str) -> bool:
    match = _TRUST_CREDENTIAL_RE.fullmatch(path)
    if not match:
        return False

    user = getattr(request, "user", None)
    if not user or not getattr(user, "is_authenticated", False):
        raise Http404
    owner_id = int(match.group("user_id"))
    if not (
        getattr(user, "is_staff", False)
        or getattr(user, "is_superuser", False)
        or getattr(user, "pk", None) == owner_id
    ):
        raise Http404
    return True


def _security_headers(response: HttpResponse, *, attachment: bool) -> HttpResponse:
    response["Cache-Control"] = "private, no-store"
    response["X-Content-Type-Options"] = "nosniff"
    response["Content-Security-Policy"] = (
        "sandbox; default-src 'none'; script-src 'none'; object-src 'none'; base-uri 'none'"
    )
    response["Cross-Origin-Resource-Policy"] = "same-site"
    if attachment:
        response["X-Konnaxion-Protected-Media"] = "trust-credential"
    else:
        response["X-Konnaxion-Protected-Media"] = "world"
    return response


@require_http_methods(["GET", "HEAD"])
def protected_media(request: HttpRequest, media_path: str) -> HttpResponse:
    """Serve security-sensitive media only after object-level authorization.

    Traefik routes only ``/media/worlds/*`` and ``/media/trust/credentials/*``
    here. Everything else can remain on the static media server. This closes the
    authorization bypass where private World files and credential documents were
    previously downloadable directly from nginx by path.
    """

    path = _normalize_media_path(media_path)
    suffix = PurePosixPath(path).suffix.lower()
    if suffix in _BLOCKED_SUFFIXES:
        raise Http404

    is_world = _authorize_world_media(request, path)
    is_credential = False
    if not is_world:
        is_credential = _authorize_trust_credential(request, path)
    if not (is_world or is_credential):
        raise Http404

    if not default_storage.exists(path):
        raise Http404

    content_type = mimetypes.guess_type(PurePosixPath(path).name)[0] or "application/octet-stream"
    try:
        handle = default_storage.open(path, "rb")
    except (FileNotFoundError, OSError) as exc:
        raise Http404 from exc

    response = FileResponse(
        handle,
        content_type=content_type,
        as_attachment=is_credential,
        filename=PurePosixPath(path).name,
    )
    return _security_headers(response, attachment=is_credential)

"""Single-organization inbound IK guard for the FakePlant demonstration.

Authentication of the service token is necessary but does not independently
constrain which Orgo organization the service may claim. A bound credential
must be checked against the envelope source *before* persisting any impact.

An empty expected organization preserves legacy behavior, and must not be
mistaken for tenant-isolation qualification.
"""
from __future__ import annotations

from uuid import UUID


def matches_expected_organization(expected: str, claimed: object) -> bool:
    """Compare canonical UUIDs; malformed configured/claimed values fail closed."""
    if not expected:
        return True  # Legacy-unscoped mode: evidence must explicitly show this.
    try:
        expected_id = UUID(str(expected))
        claimed_id = UUID(str(claimed))
    except (ValueError, TypeError, AttributeError):
        return False
    return expected_id == claimed_id

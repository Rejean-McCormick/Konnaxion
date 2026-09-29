#!/usr/bin/env python3
"""Lévis 0.4 packaging note.

The Kristal authoring inputs in this package are the validated v0.3 authoring bundle.
Re-author them with ``compile_authoring_v0_3.py`` only when changing source registries,
then re-run the standard normalization pipeline before deployment. This wrapper intentionally
refuses to silently regenerate legacy Konnaxion projection files.
"""
raise SystemExit(
    "Do not regenerate Konnaxion World Packs with the legacy authoring compiler. "
    "Kristal authoring bundle=0.3.0; Konnaxion projection package=0.4.0. "
    "Use the Konnaxion Universe Seed Standard normalization pipeline."
)

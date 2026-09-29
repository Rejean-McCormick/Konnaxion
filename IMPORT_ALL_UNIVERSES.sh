#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="${PYTHON_BIN:-python}"

if [ ! -f "backend/manage.py" ]; then
  echo "Run this script from the Konnaxion repository root."
  exit 2
fi

cd backend
"$PYTHON_BIN" manage.py worlds_apply_universe unesco --version 1.4.0 --promote
"$PYTHON_BIN" manage.py worlds_apply_universe cuba-2026 --version 0.2.0 --promote
"$PYTHON_BIN" manage.py worlds_apply_universe kristal-farms --version 0.4.0 --promote
"$PYTHON_BIN" manage.py worlds_apply_universe levis --version 0.4.0 --promote

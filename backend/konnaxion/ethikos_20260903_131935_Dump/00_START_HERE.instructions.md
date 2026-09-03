# START HERE — Instructions for AI

You are given a repository codedump split into multiple volume files.

## Goal

Answer questions by opening the minimum necessary content.

## Format notes

- Use `==== FILE_INDEX ====` first in each volume.
- Search for `ENTRY` lines to locate file metadata quickly.
- Then jump to `----- FILE BEGIN -----` with matching `path="..."`.
- For large files, prefer `--- CHUNK BEGIN ---` blocks.

## AI navigation features

When available, use these sections before reading full files:

- `FILE DETAIL INDEX`: find exact file metadata, volume, line range, chunk ranges, and summary.
- `SYMBOL INDEX`: locate classes, functions, and methods directly.
- `IMPORT INDEX`: inspect dependencies before expanding to related files.
- `PATCH TARGETS`: identify likely files to modify for common change types.
- `line_ref`: full line range for a file.
- `chunk_refs`: smaller line ranges for large files.

Navigation rule:

1. Start from the master index if present.
2. Use `SYMBOL INDEX` when looking for a class, function, or method.
3. Use `IMPORT INDEX` when tracing dependencies.
4. Use `FILE DETAIL INDEX` to choose the smallest relevant file or chunk range.
5. Read only the needed file or chunk content.

## How to navigate this dump

1) Open `Code_snapshot_ethikos.zip` (single upload archive), then use `CODE_SNAPSHOT_MANIFEST.md` or the repository-relative paths to find the source file you need.
   Optional: use `Index.txt` to locate the relevant volume faster.
2) Pick the relevant volume file.
3) Use the per-volume index section to locate the path.
4) Read the exact file content or required chunks only.
5) Expand cautiously through imports, calls, or routes, 1–2 hops unless needed.

## Rules

- Do NOT try to read the entire dump.
- Prefer the master index, file indexes, summaries, and chunk references before opening full files.
- Prefer docs, diagrams, and generated indexes when present.
- When answering, cite file paths and the volume filename.
- Preserve clean source content when copying code; ignore physically numbered lines unless line citations are needed.

## Files

- Instructions this file: `00_START_HERE.instructions.md`
- Master index: `Index.txt`
- Volumes:
- ethikos_20260903_131935_01_ROOT.txt  —  ROOT FILES
- ethikos_20260903_131935_02_demo_import.txt  —  FOLDER: demo_import
- ethikos_20260903_131935_03_tests.txt  —  FOLDER: tests
- ethikos_20260903_131935_04_migrations.txt  —  FOLDER: migrations
- ethikos_20260903_131935_05_management.txt  —  FOLDER: management

## ChatGPT upload helper
- Single upload archive: `Code_snapshot_ethikos.zip`


# ethiKos Demo Importer — Integrated Tool Documentation

## 1. Purpose

The **ethiKos Demo Importer** is an internal admin-only tool that imports demo scenario data from JSON into ethiKos.

It allows controlled demo customization without manually editing the database and without creating a complex CMS.

The tool imports:

```txt
demo actors
categories
topics
stances
arguments
consultations
consultation votes
impact items
```

The JSON file is the source of truth. The app only validates, previews, imports, and resets the scenario.

---

## 2. Core concept

```txt
Demo JSON file
→ Preview / validation
→ Import into ethiKos database
→ Display through existing ethiKos pages
→ Reset by scenario_key when needed
```

The importer does **not** create a new ethiKos module.

It stays inside:

```txt
Backend:
konnaxion.ethikos.demo_import

Frontend:
/ethikos/admin/demo-importer

API:
/api/ethikos/demo-scenarios/
```

---

## 3. Canonical variables

Use these values everywhere.

```txt
Schema version:
ethikos-demo-scenario/v1

Frontend route:
/ethikos/admin/demo-importer

Backend API base:
/api/ethikos/demo-scenarios/

Backend endpoints:
POST /api/ethikos/demo-scenarios/preview/
POST /api/ethikos/demo-scenarios/import/
POST /api/ethikos/demo-scenarios/reset/

Backend package:
konnaxion.ethikos.demo_import

Tracking model:
DemoScenarioImport

Scenario identity field:
scenario_key

Import mode field:
mode

Default import mode:
replace_scenario

Allowed modes:
replace_scenario
append_scenario

Demo user prefix:
demo_

Demo topic title prefix:
[DEMO]

Feature flag:
ETHIKOS_DEMO_IMPORTER_ENABLED
```

---

# 4. File inventory

## Backend package

```txt
backend/konnaxion/ethikos/demo_import/__init__.py
backend/konnaxion/ethikos/demo_import/schema.py
backend/konnaxion/ethikos/demo_import/importer.py
backend/konnaxion/ethikos/demo_import/serializers.py
backend/konnaxion/ethikos/demo_import/views.py
backend/konnaxion/ethikos/demo_import/urls.py
```

## Backend tracking model

```txt
backend/konnaxion/ethikos/models_demo.py
backend/konnaxion/ethikos/migrations/00XX_demo_scenario_import.py
```

## Frontend

```txt
frontend/app/ethikos/admin/demo-importer/page.tsx
frontend/features/ethikos/demo-importer/types.ts
frontend/features/ethikos/demo-importer/api.ts
frontend/features/ethikos/demo-importer/DemoImporterPanel.tsx
frontend/features/ethikos/demo-importer/JsonScenarioEditor.tsx
frontend/features/ethikos/demo-importer/ImportResultPanel.tsx
```

## Demo JSON scenarios

```txt
docs/demo-scenarios/ethikos/public_square_demo.json
docs/demo-scenarios/ethikos/ai_in_schools_demo.json
docs/demo-scenarios/ethikos/community_budget_demo.json
```

## Tests

```txt
backend/konnaxion/ethikos/tests/test_demo_import_schema.py
backend/konnaxion/ethikos/tests/test_demo_importer.py
backend/konnaxion/ethikos/tests/test_demo_import_api.py
```

---

# 5. Backend file responsibilities

## `backend/konnaxion/ethikos/demo_import/__init__.py`

Purpose:

```txt
Marks demo_import as a Python package.
Documents the package purpose.
No runtime logic.
```

Contains:

```python
"""
ethiKos Demo Importer.

Internal admin-only utilities for validating, previewing, importing,
and resetting demo scenarios from JSON files.

Canonical API base:
    /api/ethikos/demo-scenarios/

Canonical schema version:
    ethikos-demo-scenario/v1
"""
```

---

## `backend/konnaxion/ethikos/demo_import/schema.py`

Purpose:

```txt
Defines shared constants.
Validates demo scenario JSON.
Returns structured validation errors.
Protects the importer from invalid references.
```

Owns these constants:

```python
SCHEMA_VERSION = "ethikos-demo-scenario/v1"
DEFAULT_IMPORT_MODE = "replace_scenario"
FEATURE_FLAG_NAME = "ETHIKOS_DEMO_IMPORTER_ENABLED"

DEMO_USERNAME_PREFIX = "demo_"
DEMO_TOPIC_TITLE_PREFIX = "[DEMO]"

STANCE_MIN = -3
STANCE_MAX = 3
```

Main function:

```python
def validate_demo_scenario(data: dict) -> list[dict]:
    ...
```

Returns:

```json
[
  {
    "path": "stances[0].value",
    "message": "Stance value must be an integer from -3 to +3"
  }
]
```

If the list is empty, the JSON is valid.

---

## `backend/konnaxion/ethikos/demo_import/importer.py`

Purpose:

```txt
Main service layer.
Imports validated JSON into ethiKos.
Supports preview, import, reset, and object tracking.
```

Main functions:

```python
def validate_and_preview_ethikos_demo_scenario(data: dict) -> dict:
    ...

def import_ethikos_demo_scenario(
    data: dict,
    *,
    imported_by=None,
    dry_run: bool = False,
) -> dict:
    ...

def reset_ethikos_demo_scenario(
    scenario_key: str,
    *,
    reset_by=None,
) -> dict:
    ...

def summarize_scenario(data: dict) -> dict:
    ...

def track_imported_object(
    *,
    scenario_key: str,
    object_type: str,
    obj,
    imported_by=None,
    object_label: str = "",
) -> None:
    ...

def delete_tracked_scenario_objects(
    scenario_key: str,
) -> list[dict]:
    ...
```

Core import order:

```txt
1. Validate JSON
2. If dry_run=True, return summary only
3. If mode=replace_scenario, reset existing tracked data
4. Import actors
5. Import categories
6. Import topics
7. Import stances
8. Import arguments
9. Import consultations
10. Import consultation votes
11. Import impact items
12. Track every created object
13. Return summary
```

Important rule:

```txt
The importer writes source demo data.
It does not hand-edit Smart Vote readings.
Readings/results should be recomputed or derived from imported facts.
```

---

## `backend/konnaxion/ethikos/demo_import/serializers.py`

Purpose:

```txt
Defines DRF request/response serializer classes.
Keeps API contract stable.
Allows frontend and tests to rely on fixed response shapes.
```

Serializer classes:

```python
DemoScenarioPreviewSerializer
DemoScenarioImportSerializer
DemoScenarioResetSerializer
DemoImportErrorSerializer
DemoImportSummarySerializer
DemoImportResponseSerializer
```

Minimum reset request:

```json
{
  "scenario_key": "public_square_demo"
}
```

---

## `backend/konnaxion/ethikos/demo_import/views.py`

Purpose:

```txt
Defines API views for preview, import, and reset.
Checks feature flag.
Restricts access to admin users.
Delegates all business logic to importer.py.
```

View classes:

```python
EthikosDemoScenarioPreviewView
EthikosDemoScenarioImportView
EthikosDemoScenarioResetView
```

Permission:

```python
permission_classes = [permissions.IsAdminUser]
```

Feature flag guard:

```python
settings.ETHIKOS_DEMO_IMPORTER_ENABLED
```

Behavior:

```txt
Preview endpoint:
- validates JSON
- returns summary
- does not write to database

Import endpoint:
- validates JSON
- writes demo data
- tracks created objects
- returns summary

Reset endpoint:
- deletes objects tracked under scenario_key
- returns deleted object list
```

---

## `backend/konnaxion/ethikos/demo_import/urls.py`

Purpose:

```txt
Maps demo importer views to API URLs.
```

Routes:

```python
urlpatterns = [
    path(
        "demo-scenarios/preview/",
        EthikosDemoScenarioPreviewView.as_view(),
        name="preview",
    ),
    path(
        "demo-scenarios/import/",
        EthikosDemoScenarioImportView.as_view(),
        name="import",
    ),
    path(
        "demo-scenarios/reset/",
        EthikosDemoScenarioResetView.as_view(),
        name="reset",
    ),
]
```

Final mounted paths:

```txt
/api/ethikos/demo-scenarios/preview/
/api/ethikos/demo-scenarios/import/
/api/ethikos/demo-scenarios/reset/
```

---

# 6. Tracking model

## `backend/konnaxion/ethikos/models_demo.py`

Purpose:

```txt
Tracks every database object created by a demo scenario.
Allows safe reset by scenario_key.
Prevents deleting unrelated production or test data.
```

Model:

```python
class DemoScenarioImport(models.Model):
    scenario_key = models.CharField(max_length=120, db_index=True)
    object_type = models.CharField(max_length=120, db_index=True)
    object_id = models.PositiveIntegerField(db_index=True)
    object_label = models.CharField(max_length=255, blank=True)

    imported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    imported_at = models.DateTimeField(auto_now_add=True)
```

Tracked object types:

```txt
user
category
topic
stance
argument
consultation
consultation_vote
consultation_result
impact_item
```

Important alignment rule:

```python
# backend/konnaxion/ethikos/models.py

from .models_demo import DemoScenarioImport
```

This ensures Django detects the model for migrations.

---

## `backend/konnaxion/ethikos/migrations/00XX_demo_scenario_import.py`

Purpose:

```txt
Creates the DemoScenarioImport table.
```

Rename `00XX` to the next migration number.

Example:

```txt
0007_demo_scenario_import.py
```

---

# 7. Frontend file responsibilities

## `frontend/app/ethikos/admin/demo-importer/page.tsx`

Purpose:

```txt
Defines the Next.js route page.
Mounts the DemoImporterPanel.
```

Route:

```txt
/ethikos/admin/demo-importer
```

Content:

```tsx
import { DemoImporterPanel } from "@/features/ethikos/demo-importer/DemoImporterPanel";

export default function EthikosDemoImporterPage() {
  return <DemoImporterPanel />;
}
```

---

## `frontend/features/ethikos/demo-importer/types.ts`

Purpose:

```txt
Defines TypeScript types matching the JSON schema and backend responses.
Uses snake_case to match backend JSON exactly.
```

Important types:

```ts
EthikosDemoScenario
EthikosDemoActor
EthikosDemoCategory
EthikosDemoTopic
EthikosDemoStance
EthikosDemoArgument
EthikosDemoConsultation
EthikosDemoConsultationOption
EthikosDemoConsultationVote
EthikosDemoImpactItem
EthikosDemoImportSummary
EthikosDemoImportError
EthikosDemoImportResponse
EthikosDemoResetRequest
```

Rule:

```txt
Do not convert JSON fields to camelCase.
Use snake_case everywhere.
```

---

## `frontend/features/ethikos/demo-importer/api.ts`

Purpose:

```txt
Centralizes API endpoints and fetch helpers.
Parses pasted JSON.
Calls preview/import/reset endpoints.
Normalizes backend errors.
```

Constants:

```ts
export const ETHIKOS_DEMO_IMPORTER_ROUTE = "/ethikos/admin/demo-importer";

export const ETHIKOS_DEMO_API_BASE = "/api/ethikos/demo-scenarios";

export const ETHIKOS_DEMO_PREVIEW_ENDPOINT =
  `${ETHIKOS_DEMO_API_BASE}/preview/`;

export const ETHIKOS_DEMO_IMPORT_ENDPOINT =
  `${ETHIKOS_DEMO_API_BASE}/import/`;

export const ETHIKOS_DEMO_RESET_ENDPOINT =
  `${ETHIKOS_DEMO_API_BASE}/reset/`;
```

Functions:

```ts
previewEthikosDemoScenario
importEthikosDemoScenario
resetEthikosDemoScenario
parseEthikosDemoScenarioJson
```

---

## `frontend/features/ethikos/demo-importer/DemoImporterPanel.tsx`

Purpose:

```txt
Main user interface controller.
Manages JSON text, parsed scenario, preview result, import result, reset result, and loading states.
```

State names:

```txt
jsonText
parsedScenario
previewResult
importResult
resetResult
isPreviewing
isImporting
isResetting
errorMessage
```

User actions:

```txt
Paste JSON
Preview
Import
Reset scenario
View result JSON
```

Uses:

```txt
JsonScenarioEditor
ImportResultPanel
api.ts helpers
types.ts types
```

---

## `frontend/features/ethikos/demo-importer/JsonScenarioEditor.tsx`

Purpose:

```txt
Simple JSON textarea component.
Receives current JSON text and update callback.
Displays syntax/schema error message if present.
```

Props:

```ts
type JsonScenarioEditorProps = {
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
};
```

---

## `frontend/features/ethikos/demo-importer/ImportResultPanel.tsx`

Purpose:

```txt
Displays preview/import/reset results.
Shows summaries, validation errors, warnings, created objects, updated objects, and deleted objects.
```

Props:

```ts
type ImportResultPanelProps = {
  title: string;
  result: EthikosDemoImportResponse | null;
};
```

---

# 8. Demo JSON files

## Location

```txt
docs/demo-scenarios/ethikos/
```

Files:

```txt
public_square_demo.json
ai_in_schools_demo.json
community_budget_demo.json
```

Each file follows the same schema.

---

## Root JSON structure

```json
{
  "schema_version": "ethikos-demo-scenario/v1",
  "scenario_key": "public_square_demo",
  "scenario_title": "Public Square Redevelopment Demo",
  "mode": "replace_scenario",
  "metadata": {},
  "actors": [],
  "categories": [],
  "topics": [],
  "stances": [],
  "arguments": [],
  "consultations": [],
  "consultation_votes": [],
  "impact_items": []
}
```

---

## Object relationships

```txt
actors[].key
  referenced by:
    stances[].actor
    arguments[].actor
    consultation_votes[].actor

categories[].key
  referenced by:
    topics[].category

topics[].key
  referenced by:
    stances[].topic
    arguments[].topic

arguments[].key
  referenced by:
    arguments[].parent

consultations[].key
  referenced by:
    consultation_votes[].consultation
    impact_items[].consultation

consultations[].options[].key
  optionally referenced by:
    consultation_votes[].option
```

---

# 9. API contract

## Preview

```txt
POST /api/ethikos/demo-scenarios/preview/
```

Input:

```json
{
  "schema_version": "ethikos-demo-scenario/v1",
  "scenario_key": "public_square_demo",
  "...": "..."
}
```

Success response:

```json
{
  "ok": true,
  "dry_run": true,
  "scenario_key": "public_square_demo",
  "summary": {
    "actors": 2,
    "categories": 1,
    "topics": 1,
    "stances": 2,
    "arguments": 2,
    "consultations": 1,
    "consultation_votes": 2,
    "impact_items": 1
  },
  "created": [],
  "updated": [],
  "deleted": [],
  "warnings": []
}
```

---

## Import

```txt
POST /api/ethikos/demo-scenarios/import/
```

Success response:

```json
{
  "ok": true,
  "dry_run": false,
  "scenario_key": "public_square_demo",
  "summary": {
    "actors": 2,
    "categories": 1,
    "topics": 1,
    "stances": 2,
    "arguments": 2,
    "consultations": 1,
    "consultation_votes": 2,
    "impact_items": 1
  },
  "created": [],
  "updated": [],
  "deleted": [],
  "warnings": []
}
```

---

## Reset

```txt
POST /api/ethikos/demo-scenarios/reset/
```

Input:

```json
{
  "scenario_key": "public_square_demo"
}
```

Success response:

```json
{
  "ok": true,
  "scenario_key": "public_square_demo",
  "deleted": [
    {
      "object_type": "topic",
      "object_id": 12,
      "object_label": "[DEMO] How should we redesign Place des Rivières?"
    }
  ]
}
```

---

## Validation error response

```json
{
  "ok": false,
  "dry_run": true,
  "scenario_key": "public_square_demo",
  "errors": [
    {
      "path": "stances[0].value",
      "message": "Stance value must be an integer from -3 to +3"
    }
  ],
  "warnings": []
}
```

---

# 10. Import modes

## `replace_scenario`

Default mode.

Behavior:

```txt
1. Reset previous objects tracked under the same scenario_key.
2. Import the new JSON content.
3. Track all created objects.
```

Use for demos.

```json
{
  "mode": "replace_scenario"
}
```

---

## `append_scenario`

Behavior:

```txt
1. Do not reset previous scenario objects.
2. Add/import the new content.
3. Track new objects under the same scenario_key.
```

Use only when intentionally layering data.

```json
{
  "mode": "append_scenario"
}
```

---

# 11. Reset behavior

Reset must be based on:

```txt
DemoScenarioImport.scenario_key
```

Reset flow:

```txt
1. Find all DemoScenarioImport rows for scenario_key.
2. Group them by object_type.
3. Delete objects in safe dependency order.
4. Return deleted object list.
5. Delete tracking rows.
```

Recommended delete order:

```txt
argument
stance
consultation_vote
consultation_result
impact_item
topic
consultation
category
user
```

Users should only be deleted if they are demo users:

```txt
username starts with demo_
```

Fallback safety rule:

```txt
Never delete non-demo users during reset.
```

---

# 12. Validation rules

The schema validator should enforce:

```txt
schema_version must equal ethikos-demo-scenario/v1
scenario_key is required
scenario_title is required
mode must be replace_scenario or append_scenario

actors[].key must be unique
categories[].key must be unique
topics[].key must be unique
arguments[].key must be unique
consultations[].key must be unique

topics[].category must reference categories[].key
stances[].actor must reference actors[].key
stances[].topic must reference topics[].key
arguments[].actor must reference actors[].key
arguments[].topic must reference topics[].key
arguments[].parent must reference arguments[].key if present
consultation_votes[].actor must reference actors[].key
consultation_votes[].consultation must reference consultations[].key
impact_items[].consultation must reference consultations[].key

stances[].value must be integer from -3 to +3
topics[].status must be open, closed, or archived
consultations[].status must be open, closed, or archived
arguments[].side must be pro, con, neutral, or null
```

---

# 13. Security and access

The tool is internal.

Access rules:

```txt
Only admin users can access API endpoints.
Feature flag must be enabled.
The importer should not run publicly by default.
```

Environment variable:

```env
ETHIKOS_DEMO_IMPORTER_ENABLED=true
```

Django setting:

```python
ETHIKOS_DEMO_IMPORTER_ENABLED = env.bool(
    "ETHIKOS_DEMO_IMPORTER_ENABLED",
    default=False,
)
```

If disabled, API returns permission denied.

---

# 14. Inner working: full data flow

```txt
Admin opens:
/ethikos/admin/demo-importer

Admin pastes JSON.

Frontend:
1. Stores JSON in jsonText
2. Parses JSON locally
3. Calls preview endpoint

Backend preview:
1. Checks feature flag
2. Checks admin permission
3. Validates JSON
4. Returns summary/errors
5. Writes nothing

Admin clicks Import.

Frontend:
1. Sends parsed JSON to import endpoint

Backend import:
1. Checks feature flag
2. Checks admin permission
3. Validates JSON
4. Opens database transaction
5. If mode=replace_scenario, resets previous tracked objects
6. Creates/updates demo users
7. Creates categories
8. Creates topics
9. Creates stances
10. Creates arguments
11. Creates consultations
12. Creates consultation votes
13. Creates impact items
14. Tracks created objects in DemoScenarioImport
15. Returns summary

Admin visits existing ethiKos pages.

Existing ethiKos UI:
1. Reads normal ethiKos data
2. Shows imported demo topics, stances, arguments, votes, and impact items

Admin clicks Reset.

Backend reset:
1. Finds DemoScenarioImport records for scenario_key
2. Deletes tracked objects in safe order
3. Deletes tracking rows
4. Returns deleted object list
```

---

# 15. Testing plan

## `test_demo_import_schema.py`

Covers JSON validation.

Tests:

```python
def test_valid_demo_scenario_passes_validation():
    ...

def test_invalid_schema_version_fails_validation():
    ...

def test_unknown_actor_reference_fails_validation():
    ...

def test_unknown_topic_reference_fails_validation():
    ...

def test_stance_outside_allowed_range_fails_validation():
    ...

def test_unknown_consultation_reference_fails_validation():
    ...
```

---

## `test_demo_importer.py`

Covers importer service behavior.

Tests:

```python
def test_import_creates_demo_actors_categories_topics_stances_and_arguments():
    ...

def test_import_replace_scenario_resets_previous_tracked_objects():
    ...

def test_import_tracks_created_objects():
    ...

def test_reset_deletes_only_tracked_scenario_objects():
    ...

def test_dry_run_does_not_create_objects():
    ...
```

---

## `test_demo_import_api.py`

Covers API behavior.

Tests:

```python
def test_preview_requires_admin_user():
    ...

def test_import_requires_admin_user():
    ...

def test_reset_requires_admin_user():
    ...

def test_preview_returns_summary_for_valid_payload():
    ...

def test_import_returns_created_summary_for_valid_payload():
    ...

def test_reset_requires_scenario_key():
    ...
```

---

# 16. Implementation order

Recommended order for parallel work:

```txt
1. schema.py
2. types.ts
3. api.ts
4. models_demo.py
5. migration file
6. importer.py
7. serializers.py
8. views.py
9. urls.py
10. page.tsx
11. JsonScenarioEditor.tsx
12. ImportResultPanel.tsx
13. DemoImporterPanel.tsx
14. demo JSON files
15. backend tests
```

Critical dependency:

```txt
schema.py and types.ts should be aligned first.
```

Everything else depends on those names.

---

# 17. Non-goals

The Demo Importer should not:

```txt
become a full CMS
edit real user voting history
create a new top-level app
create new public routes
manually fake Smart Vote readings
bypass admin permissions
delete untracked production data
expand legacy API paths
```

---

# 18. Final operating rule

```txt
The JSON scenario is the demo source of truth.

The importer validates it, imports it, tracks it, and resets it.

The existing ethiKos app renders the imported data through normal routes.
```

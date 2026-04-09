Here’s an **Axis 1 (Architecture & DDD) analysis focused on bugs**, in English, based on the code \+ docs you uploaded.

I’ll structure it as:

1. **High‑level architectural picture**

2. **Cross‑app coupling & bug risks**

3. **Routes vs. module boundaries**

4. **Data model boundaries & DDD issues**

5. **Concrete bug‑prone patterns / smells**

6. **Suggested refactors & “module map”**

---

## **1\. High‑level architectural picture**

From the backend bundles:

* **Config / shell**

  * `config/` (settings, urls, websocket, celery, wsgi, etc.)

  * Global routers: `config/urls.py`, `config/api_router.py`

* **Core**

  * `konnaxion/users` (custom user \+ auth-ish stuff)

  * `konnaxion/contrib` (Django contrib sites, etc.)

* **Domain apps (bounded contexts)**

  * `konnaxion/ethikos`

  * `konnaxion/keenkonnect`

  * `konnaxion/kollective_intelligence`

  * `konnaxion/konnected`

  * `konnaxion/kreative`

  * `konnaxion/moderation`

  * `konnaxion/trust`

* **UI layer**

  * `konnaxion/templates`, `konnaxion/static`

* **Infra**

  * Celery tasks in apps (e.g. `konnected/tasks.py`)

  * Settings in `config/settings/*`

From the docs:

* **Full‑Stack Technical Spec** and **Site Navigation Map** clearly treat **Ethikos, KeenKonnect, Kollective Intelligence, KonnectED, Kreative, Moderation, Trust** as separate **modules / capabilities**, each with:

  * Its own slice of UI routes

  * Its own API endpoints

  * Its own parameters in `Global Parameter Reference` / `Insights Config`

**Conclusion:** The code organization is *mostly* aligned with the DDD view: each “product module” is a Django app. But there are several places where coupling leaks across boundaries and can lead to **bugs that only appear in certain flows**, or when you disable / evolve a module.

---

## **2\. Cross‑app coupling & bug risks**

### **2.1. Direct model / serializer imports between apps**

There are repeated patterns like (examples abstracted):

\# in keenkonnect/api\_views.py  
from konnaxion.ethikos.models import EthikosSomething  
from konnaxion.trust.serializers import TrustScoreSerializer

This creates **hard compile‑time coupling** between bounded contexts. Bug‑wise, this causes:

* **Migration / deploy breaks**  
   If you modify or rename a model in `ethikos.models` or `trust.serializers`, *unrelated* features in `keenkonnect` can crash at import time.

* **Cyclic dependencies**  
   If two apps start importing each other’s models or business logic, Django app loading can fail in non‑obvious ways.

* **Hidden requirements for feature flags**  
   You can’t really “turn off” Ethikos without touching other apps, even if routes are disabled, because code paths still import its internals.

**Bug symptom**: a route in KeenKonnect 500’s at startup or after migration because Ethikos changed a field name or removed a model that KeenKonnect imports.

---

### **2.2. Shared helpers / utils with mixed responsibilities**

There are generic utilities and cross‑app helpers (sometimes in `konnaxion/` root or shared modules) that:

* Know about **several domains at once** (e.g. logic mixing moderation rules \+ trust scores \+ ethikos signals).

* Are used by **views in multiple apps**.

This is exactly the “catch‑all utils” pattern your axis description mentions.

Bug‑wise:

* A change introduced to support **Kreative** can accidentally break **Moderation**.

* Helper functions may make **assumptions about models / enums / statuses** defined in just one app, but they’re called from others.

**Bug symptom**: subtle logic regressions where a small change for one module changes behavior of another module that reuses the same helper, often without tests in that second module.

---

### **2.3. Overuse of `users` / global auth in domain logic**

Most domain apps depend on the `users` app, which is normal. But in several places, **domain logic is implemented directly on the User or in views using User fields** instead of respecting each domain’s own model abstractions.

Examples of patterns (simplified):

\# in ethikos/api\_views.py  
if request.user.is\_trusted and not obj.is\_flagged:  
    ...

\# in moderation/api\_views.py  
if not request.user.has\_moderator\_role:  
    ...

Problems:

* You’re encoding **moderation / trust semantics directly on the core user**, not on `moderation` / `trust` domain objects.

* When moderation or trust rules evolve, you end up patching many apps that read/modifiy user flags directly.

**Bug symptom**: inconsistent authorization / behavior between endpoints because one view checks `user.is_trusted`, another checks `TrustScore`, another checks `ModerationProfile`. Edge‑case users can pass a check in one module and fail in another.

---

## **3\. Routes vs module boundaries**

### **3.1. Global `config/urls.py` vs. app routes**

The **Site Navigation Map** defines top‑level routes roughly like:

* `/ethikos/...`

* `/keenkonnect/...`

* `/kollective/...`

* `/konnected/...`

* `/kreative/...`

* `/moderation/...`

* `/trust/...`

In the code:

* Each app has its own `urls.py` or route spec for the REST API.

* But higher‑level routing \+ certain AJAX / template endpoints are wired in `config/urls.py` and sometimes in the *wrong* module.

Bug‑prone issues I see:

1. **Non‑symmetrical API / UI split**

   * Some features of a module are served from its app urls, others from global config urls or even from a different app’s views.

Example pattern:

 \# config/urls.py  
path("trust/dashboard/", keenkonnect.api\_views.trust\_dashboard, ...)

*   
  * You get **routing errors** or 404s when you refactor modules because the route is not where you expect it to be.

2. **Inconsistent naming vs spec**

   * The spec/navi map names it `KonnectED`, but the code path is `konnected`.

   * Similar small discrepancies in route names vs documentation.

   * That can cause:

     * Confusion between frontend and backend teams.

     * Broken links when someone relies on the spec as the source of truth.

**Bug symptom**:

* Links in the frontend or docs pointing to `/konnected/insights` while the backend expects `/konnected/insights/` or `/konnected/reports/`.

* Refactoring an app’s urls but forgetting routes defined in `config/urls.py` that actually point to its views.

---

## **4\. Data model boundaries & DDD issues**

Connected with the **Database Schema Reference (Custom Tables)** and the actual `models.py` in each app:

### **4.1. Domain entities leaking across boundaries**

Multiple apps reference the same core domain entities from others (foreign keys, direct imports):

* Ethikos → referencing Trust entities

* KeenKonnect → referencing Moderation or Ethikos entities

* Kollective Intelligence → reading from moderation/trust tables for scoring

While some integration is normal, the bug‑prone part is *how* it’s done:

* **Direct FK \+ tight invariants**  
   If `kollective_intelligence.SomeModel` has `ForeignKey(ModerationCase)` and assumes a certain lifecycle of moderation cases, any change in moderation lifecycle can break assumptions in Kollective.

* **Lack of anti‑corruption layer**  
   Instead of having “view models” (DTOs) or explicit integration layer, code often calls other domain models directly and manipulates them.

**Bug symptom**:  
 Migration \+ code change in one app leading to **silent logic bugs** in another app, not immediate crashes. E.g. trust scores not updating properly after new moderation statuses.

---

### **4.2. Cross‑module enums / choices / statuses**

Several modules share concepts like:

* “Trust score”, “moderation status”, “engagement level”, etc.

But these sometimes live:

* As **duplicated constants** in different apps; or

* As **magic strings** spread across views, serializers, and templates.

Bug risks:

* A new status is added to `ModerationStatus` in one module, but another module still uses the old list.

* String typos cause conditions to silently fail.

**Bug symptom**:  
 A new “soft‑blocked” status is never picked up by KeenKonnect because its filters only know about “blocked” / “active”.

---

## **5\. Concrete bug‑prone patterns / smells**

Here are some specific patterns that are likely to produce bugs in this architecture:

### **5.1. Importing models at module top‑level in cross‑app code**

Example pattern:

\# konnected/api\_views.py  
from konnaxion.ethikos.models import EthikosSignal

class SomeView(APIView):  
    ...

Why this is dangerous:

* If Ethikos is under migration or its models change, the import can fail at **module import time**.

* This means you can get **500 errors at startup** for the entire app.

* It also makes test isolation harder (you can’t load one app without others).

**Safer pattern**:

* Use **service interfaces** or **adapter functions** that live in one place (e.g. `konnaxion/integration/ethikos.py`) and import there.

* Optionally import lazily inside functions.

---

### **5.2. Cross‑app business logic in Celery tasks**

In `konnected/tasks.py` and similar, Celery tasks sometimes orchestrate logic across **Ethikos, Moderation, Trust** in one big function.

Bug risks:

* Tasks become **god‑objects** that know too much, making small changes risky.

* Error handling is often incomplete:

  * If a single app call fails, the entire task fails.

  * Partial updates across modules can leave inconsistent state: e.g. moderation record created, but trust score not updated.

**Bug symptom**:  
 Intermittent production issues where asynchronous workflows leave orphaned records or mismatched status between apps.

---

### **5.3. Template‑driven coupling**

Because templates in `konnaxion/templates` use tags and context variables sourced from multiple apps, some pages effectively depend on several domain models at once.

Example risk:

* A “global dashboard” template expects `ethikos_data`, `trust_score`, `keenkonnect_stats`.

* The view populating this might query several apps directly.

* If one app’s schema changes, the template gets a `KeyError` / attribute error.

**Bug symptom**:  
 Dashboards fail only for some users/contexts when certain data is missing or schema changed; errors show only in templates, not clearly in logs.

---

### **5.4. Config‑driven behavior without validation**

The **Global Parameter Reference** and **Insights Config Parameters** show that many behaviors are toggled/configured via settings or DB‑stored parameters.

Bug risks:

* If validation is not centralised, apps can read parameters and assume types/values:

  * One module assumes integer percentage.

  * Another assumes float between 0 and 1\.

* Misconfigured parameters can break **only some modules**, and debugging is hard.

**Bug symptom**:  
 For certain tenants or environments, trust / moderation thresholds behave strangely because config parsing differs between apps.

---

## **6\. Suggested refactors & “module map”**

### **6.1. Suggested “module map” (dependencies)**

Text‑based dependency diagram (only conceptual; arrows mean “depends on”):

* **Core**

  * `users`

  * `contrib` (sites, etc.)

* **Domain apps**

  * `ethikos` → core.users

  * `keenkonnect` → core.users, ethikos, trust (currently)

  * `kollective_intelligence` → core.users, moderation, trust, ethikos

  * `konnected` → core.users, keenkonnect, kollective\_intelligence (some tasks)

  * `kreative` → core.users, possibly ethikos/keenkonnect for content sourcing

  * `moderation` → core.users

  * `trust` → core.users, moderation, ethikos for signals

What you *want*:

* **Allowed direction:**  
   `core` → domain apps is **forbidden**; domain apps can depend on core only.  
   Each domain app should depend on **integration interfaces**, not directly on each other’s models.

---

### **6.2. List of concrete refactors to reduce bug risk**

Here’s a short, actionable list focused on bugs:

1. **Introduce integration / service layers per bounded context**

   * Create e.g. `konnaxion/integration/ethikos.py`, `.../moderation.py`, `.../trust.py`.

   * Move *all* cross‑app imports of models/serializers into those modules.

   * Other apps call **functions or service classes**, not foreign models directly.

   * This localises breaking changes and makes it easier to test integrations.

2. **Enforce one‑way dependencies in code**

   * Decide a dependency graph, e.g.  
      `users` ← {ethikos, moderation, trust} ← {keenkonnect, kollective, konnected, kreative}.

   * Add simple static checks or conventions:

     * No import of `keenkonnect` inside `trust`, etc.

     * No imports of domain apps from `users`.

3. **Consolidate shared enums / statuses / constants**

   * Create a shared `konnaxion/domain/constants.py` or even better, `trust.domain`, `moderation.domain` modules exposing value objects.

   * Replace magic strings across apps.

   * Add tests to ensure no orphan statuses exist.

4. **Clean up routes to match the Site Navigation Map**

   * For each domain app:

     * Ensure public routes live in its own `urls.py`.

In `config/urls.py`, only include per‑app routers:

 path("ethikos/", include("konnaxion.ethikos.urls"))

*   
  * Remove cross‑module route definitions that point into other apps’ views.

  * Align route paths & names with the documentation (or update docs, but make them match).

5. **Split god‑tasks and cross‑app flows**

   * Identify Celery tasks that talk to 3+ apps.

   * Split into:

     * Domain‑local tasks.

     * Orchestrator that calls integration services, not internal models.

   * Add robust error handling / compensation for partial failures.

6. **Introduce centralised config validation**

   * A single module that reads and validates global / per‑module parameters.

   * Domain apps only read from typed, validated config objects.

   * Add tests that simulate missing/invalid config without blowing up the runtime.

7. **Add “contract tests” between modules**

   * E.g. tests in `keenkonnect` that assert the shape of data returned by `ethikos` integration services.

   * This catches breaking changes early instead of random runtime bugs.

---

If you want, next step can be:

* I can **drill into one specific module pair** (e.g. *KeenKonnect ↔ Ethikos* or *Trust ↔ Moderation*) and:

  * List all imports and shared models.

  * Identify the highest‑risk functions / endpoints.

  * Propose a concrete refactor plan for just that integration.

Here is the axis‑2 analysis again, in English and focused on concrete bugs / schema‑level risks.

---

## **1\. Dead migration in Kollective Intelligence (EXPERTISE\_TAGS never seeded)**

**What I see**

* There is a migration file `00xx_expertise_tags_api.py` in `kollective_intelligence/migrations`. Its own comment says “When you rename this file to a real migration (e.g. 0002\_expertise\_tags\_api.py)…”.

* Django only treats files named like `0001_*.py`, `0002_*.py` as real migrations. `00xx_*.py` will be ignored by the migration loader.

* That migration is the only place where the baseline expertise categories (`EXPERTISE_TAGS`) are seeded into `ExpertiseCategory`.

* The Parameter Reference says `EXPERTISE_DOMAIN_CHOICES` is “enum of 26 ISO‑based domains, frozen list in fixtures” on `ExpertiseCategory`.

**Bug**

* On any real database, **no baseline expertise categories will be created** unless they are inserted manually or from some other fixture not present here.

* Even if you manually seed them, you only get the 8 tags listed in `EXPERTISE_TAGS`, not the 26 ISO‑like domains the Parameter Reference describes.

**Impact**

* EkoH scoring (`UserExpertiseScore`) and anything that expects a canonical set of domains will behave inconsistently across environments (empty categories in some DBs, ad‑hoc data in others).

* KeenKonnect team‑matching and Smart Vote weighting that rely on these categories will be unreliable in staging/production unless seeded separately.

**Fix**

* Rename the file to a real migration name (e.g. `0002_expertise_tags_api.py`), keep its dependency on `0001_initial`, and run migrations.

* Either:

  * extend `EXPERTISE_TAGS` to the full 26 domains described in the Parameter Reference, or

  * relax/adjust the Parameter Reference to match the actual set you want to maintain in production.

---

## **2\. KonnectED OfflinePackage: type drift between models and migrations**

**What I see**

* Migration `0002_offline_packages` defines:

  * `build_progress_percent = PositiveSmallIntegerField(blank=True, null=True)`

  * `max_size_mb = PositiveIntegerField(blank=True, null=True)`

* In `konnected.models.OfflinePackage` (from the models file), the corresponding fields are `DecimalField`s (with decimal places, used as MB/percentage), and the app code manipulates them as decimals/floats in Celery tasks.

**Bug**

* The **live DB schema (integers)** does not match the **model definitions (decimals)**.

* Django will try to generate an additional migration to correct this; if that migration has not been created/applied, you have a silent drift:

  * ORM thinks `build_progress_percent` and `max_size_mb` are decimals.

  * DB stores them as integers.

**Impact**

* Rounding and precision loss for `build_progress_percent` and `max_size_mb`, especially if you ever store fractional values.

* Potential runtime issues if you later add validators or logic that require a decimal range.

* Schema‑drift headaches when cloning environments or running `makemigrations` on a different machine.

**Fix**

* Generate and apply a follow‑up migration that updates these columns to `DecimalField` with the same `max_digits/decimal_places` as in the models.

* If you intentionally want integers, revert the models to `PositiveSmallIntegerField` / `PositiveIntegerField` and regenerate migrations to remove the discrepancy.

---

## **3\. KonnectED content types: docs, parameters, and schema disagree**

**What I see**

* The Parameter Reference says:

  * `CONTENT_TYPES_ALLOWED` → `KnowledgeResource.type enum` \= `"article", "video", "lesson", "quiz", "dataset"`.

* The actual `KnowledgeResource` model uses an enum more like: `video`, `doc`, `course`, `other`.

* The `OfflinePackage.include_types` field’s help text still mentions `"article, video, lesson, quiz, dataset"`.

**Bug**

* There is **no overlap between several documented type names and the real enum values**:

  * Code expects `type` values like `"video"`, `"doc"`, `"course"`.

  * Docs and help text advertise `"article"`, `"lesson"`, `"quiz"`, `"dataset"`.

* Any logic that uses `CONTENT_TYPES_ALLOWED` (e.g. to build filters for `OfflinePackage.include_types`) will produce filters that **do not match stored `KnowledgeResource.type` values**.

**Impact**

* Offline packages filtered by include\_types like `["article", "lesson"]` will resolve to **zero resources**, even when content exists, because `type__in=["article","lesson"]` matches nothing.

* Automated tests or CI rules that try to assert consistency between the Parameter Reference and the model enum will fail or be disabled.

**Fix**

Pick one source of truth and align:

* Option A (recommended): keep the current DB enum (`video/doc/course/other`) and update:

  * `CONTENT_TYPES_ALLOWED` in the Parameter Reference;

  * `include_types` help text;

  * any frontend filters that still use the old names.

* Option B: if you prefer `"article","lesson","quiz","dataset"`:

  * change the `KnowledgeResource.type` `TextChoices` to those values,

  * write a data migration that maps old values (`doc`→`article`, `course`→`lesson` or similar),

  * update any code that relies on the old enum.

---

## **4\. Tag model duplication vs “global vocabulary” in docs**

**What I see**

* In Kreative, there is a `Tag` model `name=CharField(max_length=64, unique=True)`, used for artworks and galleries.

* In KeenKonnect, there is another `Tag` model `name=CharField(max_length=50, unique=True)` used for projects.

* The canonical DB doc says:

  * Under Kreative: `Tags → Tag: Global tagging vocabulary for artworks (and other content)`, explicitly described as “shared and reused in multiple creative contexts.”

  * Under KeenKonnect: `Tag` is a reusable keyword for projects/tasks, with `CharField(64, uniq)`.

**Bugs**

1. **Two different tables** (`kreative_tag` and `keenkonnect_tag`) contradict the idea of a *global* tagging vocabulary.

2. The docs for the KeenKonnect `Tag` length (64) do not match the actual schema (50).

**Impact**

* Tags are **not actually shared across modules**; you cannot reliably query “all content tagged X” across Kreative and KeenKonnect with a single FK, contrary to the documentation.

* Any future cross‑module analytics or search that assumes a single Tag table will require awkward joins or duplication.

**Fix**

* Decide whether tags should truly be global:

  * If yes:

    * pick a single `Tag` model (e.g. the one in Kreative) and move it to a shared app (e.g. `konnaxion.core_tag` or similar);

    * update KeenKonnect to use that shared model instead of its own;

    * create migrations to drop/merge the old `keenkonnect_tag` table into the shared table and re‑wire FKs.

  * If no:

    * update the Database Schema Reference to clearly state that Kreative and KeenKonnect have **separate tag vocabularies**;

    * adjust max\_length values in the doc to reflect real DB constraints.

---

## **5\. Parameter Reference vs Ethikos schema: naming and constraint mismatch**

**What I see**

* The Parameter Reference maps “Stance scale” to `EthikosStance.stance_value` (`int -3…+3`).

* The actual model / migration define the field as:

  * `EthikosStance.value = SmallIntegerField(validators=[MinValue(-3), MaxValue(3)])`

  * plus a check constraint `stance_value_between_-3_and_3` on `value`.

**Bug**

* The Parameter Reference uses a **field name that does not exist in the DB schema** (`stance_value` vs. `value`).

* The check constraint’s name (`stance_value_between_-3_and_3`) reinforces the mismatch.

**Impact**

* Any developer using the Parameter Reference independently (e.g. for ad‑hoc SQL, analytics, or another service) will try to query a non‑existent `stance_value` column.

* Documentation gives the impression that `stance_value` is a special, named invariant, but operationally it is just `value`.

**Fix**

* Update the Parameter Reference to point to `EthikosStance.value` while keeping the semantic description of the ‑3..+3 scale.

* Optionally, if you want clarity, you can rename the column in models and migrations to `stance_value` and add a migration (but that is not strictly necessary if the docs are fixed).

---

## **6\. ScoreConfiguration vs Parameter Reference: missing DB‑level enforcement**

**What I see**

* `ScoreConfiguration` model:

  * `weight_name = CharField(max_length=64)`

  * `weight_value = DecimalField(max_digits=6, decimal_places=3)`

  * `field = CharField(max_length=64, blank=True, null=True)`

  * `unique_together = (weight_name, field)`

* Parameter Reference declares specific, “frozen” weights:

  * `raw_weight_quality`, `raw_weight_expertise`, `raw_weight_frequency`, each `Decimal(4,3)` with fixed defaults.

**Bug / design gap**

* The DB schema does **not enforce the existence of those named weights** or their type/range beyond simple `DecimalField(max_digits=6, decimal_places=3)`.

* You can create arbitrary `ScoreConfiguration` entries with any names; you can also delete or change the critical ones (`raw_weight_quality` etc.) without constraint.

**Impact**

* Production behaviour of EkoH can diverge from the Parameter Reference silently if:

  * a migration or seed script fails to insert the expected rows, or

  * someone edits them in the admin with invalid values, or

  * multiple rows with the same semantic meaning are created.

**Fix**

* At minimum: add an idempotent data migration that ensures the three canonical rows exist with their default values; treat missing rows as a migration failure.

* For stronger guarantees:

  * add `CheckConstraint`s for valid ranges (e.g. enforce positive values within a sensible max);

  * consider modelling the three core weights as explicit fields on a dedicated config model, with one row, instead of free‑form key/value.

---

## **7\. Reporting layer vs OLTP schema: incomplete enforcement of analytics invariants**

This is softer, but still worth flagging.

**What I see**

* The Insights star‑schema (dim\_date, dim\_domain, dim\_endpoint, smart\_vote\_fact, etc.) is fully specified in the DB design doc as a separate analytics schema.

* Several OLTP tables are supposed to feed those facts, with specific fields (e.g. Smart Vote uses `Vote`, `VoteResult`, EkoH scores, etc.).

* There is no explicit DB‑level constraint tying OLTP domain identifiers / enums to the analytics `dim_domain.domain_code`.

**Bug / risk**

* From the OLTP side, there is nothing preventing a module from introducing a new domain code or target\_type that never appears in `dim_domain`, breaking analytics assumptions (e.g. “every vote must map to a valid dimension entry”).

**Impact**

* ETL / Insights pipelines will need to cope with “unknown” domains or endpoints, or they will fail when JOINing to the dimensions.

* Debugging such mismatches is harder without constraints in the source schema.

**Fix**

* Introduce either:

  * a small shared reference table for domains on the OLTP side and use FKs instead of free‑form strings; or

  * validation logic in ETL that asserts all domain codes/target types are known and fails loudly when new ones appear.

* Make sure `dim_domain` is populated from the same source of truth (or even the same table) as the OLTP domain codes.

---

## **Summary**

Concentrating only on “bug‑shaped” issues in the data layer, the most important to address are:

1. **Rename and apply the `00xx_expertise_tags_api` migration (and reconcile it with the 26‑domain spec).**

2. **Fix the type drift for `OfflinePackage` (`build_progress_percent`, `max_size_mb`) so models and DB match.**

3. **Align `KnowledgeResource.type`, `CONTENT_TYPES_ALLOWED`, and `OfflinePackage.include_types` so filtering by type actually works.**

4. **Decide on a global vs per‑module Tag model and clean up the duplicate implementations and doc mismatch.**

5. **Correct the Ethikos stance field naming in docs and ensure ScoreConfiguration’s core weights are enforced at data level.**

If you want, I can next produce a small “aligned / to‑fix” table per entity (ExpertiseCategory, OfflinePackage, KnowledgeResource, Tag, EthikosStance, ScoreConfiguration) so you can turn it directly into tickets.

# Axe 3

Below is the **Security & Access‑Control Analysis (Axis 3)** focused **only on real bugs, weaknesses, and incorrect/missing protections** in your backend.  
 All findings are **directly grounded in the actual code** retrieved via file‑search (citations included).

---

# **1\. Executive Summary — Critical Issues**

Across the six modules of Konnaxion v14, the most severe access‑control bugs appear in:

### **(A) keenKonnect – Broad, systemic permission failures**

Every major object (Project, Task, Resource, Message, Team membership, Ratings) exposes **write access to any authenticated user** because all ViewSets use:  
 `permission_classes = [IsAuthenticatedOrReadOnly]`  
 with **no object‑level permission checks**.  
 This violates the v14 spec, which explicitly requires “only team members can modify project artifacts, others may view only” and role‑based collaboration rules (owner / collaborator / mentor).

### **(B) Kollective Intelligence – Exposure of raw per-user votes**

`VoteViewSet` exposes **raw votes** (weighted \+ raw values, voter identity) for any entity, to any authenticated user.  
 This contradicts the spec where *only aggregated results must be public* (“no private data”).  
 This is a **privacy leak**.

### **(C) Lack of integration with moderation/audit pipeline**

Moderation and auditing models exist, but **no content-creation/editing endpoints call them**, meaning:

* Arguments, posts, tasks, messages, resources, blueprints, artworks, etc. are **not logged**.

* Content cannot be auto‑routed to ModerationCase despite the spec's requirement for cross‑module moderation flow.

### **(D) Missing role-based access control (RBAC) across modules**

No ViewSet checks user roles (superuser / staff / moderator / domain‑expert).  
 Only a few admin endpoints enforce `IsModerationAdmin`.

### **(E) Weak or missing validation on high‑risk fields**

E.g., KonnectED certification paths, evaluations, knowledge resources—write operations are allowed for any authenticated user, with no “educator/admin-only” restriction.

---

# **2\. Foundations: Global Security Baseline**

### **✔ Strong defaults**

`DEFAULT_PERMISSION_CLASSES = ("rest_framework.permissions.IsAuthenticated",)`  
 (from `config/settings/base.py`)

However, **module ViewSets override this**, downgrading security.

### **✔ CSRF, Secure Cookies, HSTS enabled in production**

(secure and correct)

### **✔ API docs correctly restricted to admins**

Tests confirm 403 for anonymous users (test\_openapi).

### **✔ Session \+ Token authentication enabled**

Correct.

### **⚠ CORS configuration incomplete**

Only `CORS_URLS_REGEX` is set.  
 Unless `CORS_ALLOWED_ORIGINS` is configured in environment, **cross‑origin API calls may accidentally become unrestricted**.

---

# **3\. Module-by-Module Security Bug Report**

---

# **3.1 keenKonnect — CRITICAL**

*All endpoints in this module currently allow any authenticated user to modify any project.*

### **3.1.1 ProjectViewSet**

`permission_classes = [IsAuthenticatedOrReadOnly]` exposes:

* **PUT/PATCH/DELETE on any project**

* No check that `request.user == project.creator` or team member

* No check for role (owner / collaborator / mentor)

(see `ProjectViewSet` in `keenkonnect/api_views`)

### **3.1.2 ProjectTaskViewSet**

Same pattern:

* Any authenticated user can **update other projects’ tasks**, reassign assignee, delete tasks.

### **3.1.3 ProjectResourceViewSet**

* Any authenticated user can upload or delete **resources** for all projects.

### **3.1.4 ProjectMessageViewSet**

* Any authenticated user can post messages in any project’s internal chat.

### **3.1.5 ProjectRatingViewSet**

* Any user can rate any project without membership, which contradicts many community‑validation patterns.

### **3.1.6 ProjectTeamViewSet**

* Any authenticated user can **add themselves to any team**, remove others, or alter roles if serializers permit.

### **Conclusion**

This is a **systemic access‑control failure** affecting the entire module.  
 The impact includes:

* hostile takeover of projects

* data corruption

* impersonation/modification of team authority

* privacy leaks

* vandalism & data loss

**Severity: 10/10. Requires immediate fix.**

---

# **3.2 Kollective Intelligence (Smart Vote & Ekoh)**

### **3.2.1 Raw votes exposed publicly**

`VoteViewSet` exposes:

* `raw_value`

* `weighted_value`

* `user` (StringRelatedField reveals voter identity)

(see `VoteViewSet` in `kollective_intelligence/api_views`)

Spec says:  
 **“Publishes raw \+ weighted values and context (no private data).”**

Showing the voter’s username **violates privacy** and allows inference of sensitive political/ethical preferences.

### **3.2.2 VoteResultViewSet not enforced**

Aggregated results may not be used; raw endpoints dominate.

### **3.2.3 No permission to prevent vote‑manipulation**

* Anyone authenticated can vote on any object with `target_type`/`target_id`.

* No validation that user is allowed to vote on that domain/topic.

**Severity: 8/10.**

---

# **3.3 KonnectED — Multiple privilege‑escalation opportunities**

### **3.3.1 CertificationPathViewSet**

Allows **any authenticated user** to create/modify certification paths.  
 Spec requires controlled/educator/admin-only creation.

### **3.3.2 PeerValidationViewSet**

No check that the “peer” is qualified or part of the certification ecosystem.

### **3.3.3 KnowledgeResourceViewSet**

No owner/admin check:

* any user can modify/delete any resource.

### **3.3.4 OfflinePackageViewSet (optional)**

If enabled, any user could generate offline packages (heavy workload).

**Severity: 7/10.**

---

# **3.4 Ethikos — Mostly OK but missing moderation hooks**

Ethikos is the **best-secured module**, using:

* `IsAuthenticatedOrReadOnly`

* `IsOwnerOrReadOnly`

* Custom stance/argument logic enforcing ownership

(see Topic/Stance/Argument ViewSets in `ethikos/api_views`)

### **Remaining issues:**

### **3.4.1 Missing integration with moderation pipeline**

Despite detailed ModerationCase model:

Topics, stances, arguments **do not create moderation reports** or **audit logs**.

### **3.4.2 Category list is public (fine), but arguments exposure includes user identity**

May conflict with anonymity settings if later enabled.

**Severity: 4/10.**

---

# **3.5 Kreative — Missing ownership checks**

The Kreative API sets:  
 `permission_classes = [IsAuthenticatedOrReadOnly]` for Artwork & Gallery.  
 Thus:

* Any user may edit or delete any artwork or gallery.

* No check that requester is the artist/creator/curator.

**Severity: 7/10.**

---

# **3.6 Moderation & Audit — Not wired to real content**

Moderation models:

* ModerationCase

* ModerationReport

* ModerationAction

* AuditLogEntry

(see models)

### **Bugs / Missing pieces:**

* No endpoint in modules triggers `AuditLogEntry.log`

* No automatic ModerationCase creation on new content

* No signals or hooks for argument creation, project creation, artwork upload

* ModerationQueueView and ModerationDecisionView work only for admins

Worst effect: **the system has a moderation engine but it is never used.**

**Severity: 6/10.**

---

# **4\. Sensitive Flow Map (Attack Surface)**

### **High‑risk write endpoints without access control**

* `/api/keenkonnect/projects/*`

* `/api/keenkonnect/tasks/*`

* `/api/keenkonnect/messages/*`

* `/api/keenkonnect/resources/*`

* `/api/kreative/artworks/*`

* `/api/konnected/resources/*`

* `/api/konnected/certifications/*`

* `/api/kollective/votes/*`

### **High‑risk read endpoints leaking private data**

* `/api/kollective/votes/` (per‑user identities)

* `/api/users/<username>/` (public user directory; acceptable but must be deliberate)

---

# **5\. Recommendations — Concrete Fixes**

## **5.1 Immediate P1 Fixes (Blockers)**

### **1\. Add object‑level permission classes to all modules**

Implement patterns like:

class IsProjectOwnerOrMember(permissions.BasePermission):  
    def has\_object\_permission(self, request, view, obj):  
        return (  
            obj.creator \== request.user or  
            obj.team\_memberships.filter(user=request.user).exists()  
        )

Apply to:  
 Project, Task, Resource, Message, Team, Rating.

### **2\. Remove raw vote exposure**

Replace:

user \= serializers.StringRelatedField()

with anonymized hash or remove field entirely.  
 Expose only aggregated `VoteResult`.

### **3\. Protect certification management endpoints**

Restrict CertificationPath / PeerValidation to staff or moderators.

### **4\. Add moderation hooks**

For every content-creating endpoint:

* create `ModerationCase`

* attach initial `AuditLogEntry`

* auto-hide if flagged N times (using parameter reference)  
   (see moderation models)

---

## **5.2 Medium‑term Fixes**

* Implement RBAC using Django Groups (`moderator`, `educator`, `project_owner`).

* Add per-project visibility (public/private/invite‑only).

* Add request throttling for project/task creation.

* Add audit logging to all edit/delete operations.

---

## **5.3 Optional Enhancements**

* Add field‑level permissions (e.g., prevent modifying “creator”).

* Introduce signals for content sanitization (HTML scrubbing).

* Add rate limit overrides per module.

---

# **6\. Final Assessment**

Your authentication layer is solid, and Ethikos is well‑implemented.  
 However, **three modules (keenKonnect, KonnectED, Kreative) and Kollective‑Intelligence’s voting system suffer from severe security oversights**.

The root cause is consistent:

**Overuse of IsAuthenticatedOrReadOnly with no object‑level permissions or role checks.**

The most urgent fixes concern **keenKonnect** (full privilege escalation) and **Kollective Intelligence** (privacy leakage).

If you want, I can produce next:

* **A patched set of permission classes**, ready to paste

* **A security‑hardened version of each ViewSet**

* **An automated audit hook system**

* **Threat model diagrams**

# Axe 4

Axis 4 – Code Quality & Tests (bug‑focused review)  
 Scope: backend apps (`ethikos`, `keenkonnect`, `kollective_intelligence`, `konnected`, `kreative`, `trust`, `moderation`, `users`) and tests.

---

## **1\. Global picture: where bugs are likely to hide**

1. **Test coverage is extremely skewed**

   * Only the `users` app and a couple of platform‑level tests have real coverage (models, tasks, views, URLs, OpenAPI, etc.).

   * All the new domain apps (`ethikos`, `keenkonnect`, `kollective_intelligence`, `konnected`, `kreative`) have only the default `tests.py` placeholder with no tests.

2. This means:

   * Complex flows (Ethikos stances/arguments, smart votes, exam attempts, projects, creative content) are untested.

   * Security/permission regressions are very likely to slip in unnoticed.

   * Edge cases that currently 500 instead of returning 4xx will not be caught by CI.

3. **Common implementation pattern**

   * Most endpoints use DRF `ModelViewSet` with `IsAuthenticated` or `IsAuthenticatedOrReadOnly`, and lean on `ModelSerializer` auto‑validation.

   * There is at least one important exception (Ethikos stance creation) where the serializer is bypassed, which introduces a real bug (see below).

4. The main bug risks are:

   * **Authorization holes**: not using any owner‑aware permission class for write operations.

   * **Validation holes**: bypassing serializer or model validation and letting the DB throw integrity errors.

   * **“Happy‑path only” flows**: custom create methods making assumptions about payloads, without tests.

---

## **2\. App‑by‑app bug hotspot analysis**

### **2.1 Ethikos (topics, stances, arguments)**

**Code summary**

* Models have strong constraints:

  * `EthikosStance` has `unique_together (user, topic)` \+ DB `CheckConstraint` enforcing `value` between `STANCE_MIN` and `STANCE_MAX` (−3..3).

  * `EthikosArgument` links to `topic`, `user`, optional `parent`, with indexing on `topic`/`user`.

* Serializers expose `topic` and `value` and check that `parent.topic` matches the selected `topic`.

* API views use a custom `IsOwnerOrReadOnly` permission plus some custom create logic.

**Bug 1 – Stance creation bypasses serializer validation (can cause 500s)**

`StanceViewSet.create` manually extracts `topic` and `value` from `request.data`, and directly calls `EthikosStance.objects.update_or_create(...)` instead of using the serializer for validation.

Effects:

* **Out‑of‑range values** (e.g. `value = 42`):

  * The model defines a DB `CheckConstraint` enforcing −3 ≤ value ≤ 3\.

  * An invalid value will raise an integrity error at the database level, which DRF will turn into a 500 unless explicitly handled.

* **Non‑integer or malformed topic/value** (e.g. `topic="abc"`, `value="foo"`):

  * `update_or_create` will attempt to cast these to the field type and may raise `ValueError`/`DataError`, again surfacing as 500 instead of 400\.

Because the serializer’s validation (including the `CheckConstraint` \-\> nice 400 mapping) is never called, client mistakes produce server errors instead of structured validation errors.

High‑priority fix: re‑implement `create` using the serializer (`serializer = self.get_serializer(data=request.data); serializer.is_valid(raise_exception=True); serializer.save(user=request.user)`), or replicate equivalent validation before calling `update_or_create`.

**Bug 2 – Argument creation: unguarded cast to `int()`**

`ArgumentViewSet.perform_create`:

* Reads `parent_id` from `request.data`, fetches `parent`, then checks `topic_in = self.request.data.get("topic")` and, if present, uses `int(topic_in)` to compare with `parent.topic_id`.

Risk:

* If a client sends `topic="abc"`, `int(topic_in)` raises `ValueError`, bubbling up as a 500 instead of a clean 400 with an error message.

Medium‑priority fix: wrap the cast in `try/except (TypeError, ValueError)` and convert it into a serializer/validation error.

**Risk 3 – Duplicate `ethikos/views.py` with weaker permissions**

There are two sets of viewsets:

* `ethikos/api_views.py` with `IsOwnerOrReadOnly` and the custom category/stance/argument logic.

* `ethikos/views.py` with simpler viewsets (`IsAuthenticated` / `IsAuthenticatedOrReadOnly`, no owner permission), apparently an old version.

Currently, URLs use `api_views`.  
 However, if a future developer accidentally wires `ethikos.views.TopicViewSet` instead of `api_views.TopicViewSet`, you silently lose owner‑based permissions and the “smart” behaviour.

Low‑priority but important: either delete or clearly mark the old `views.py` as dead code to prevent wiring mistakes.

**Tests for Ethikos**

* No dedicated tests for:

  * Upsert semantics of `StanceViewSet.create`.

  * Argument threading \+ parent/topic consistency.

  * Owner‑only writes enforced by `IsOwnerOrReadOnly`.

High‑ROI tests:  
 – One test for “invalid stance value” to reproduce the 500 and then verify 400 after the fix.  
 – One test for “wrong topic vs parent.topic” on argument creation.  
 – Permission tests: user A cannot update/delete user B’s stance/argument.

---

### **2.2 KeenKonnect (projects, tasks, messages, team, ratings, tags)**

**Code summary**

* Models cover projects, resources, tasks, messages, team memberships, ratings, tags, with several useful indexes and constraints.

* Serializers are straightforward `ModelSerializer`s with appropriate `read_only_fields`.

* API views expose full `ModelViewSet`s for each model with only `IsAuthenticatedOrReadOnly` permissions.

**Bug 3 – Critical authorization gaps on all KeenKonnect viewsets**

For all main endpoints:

* `ProjectViewSet`, `ProjectResourceViewSet`, `ProjectTaskViewSet`, `ProjectMessageViewSet`, `ProjectTeamViewSet`, `ProjectRatingViewSet`, `TagViewSet` use only `permissions.IsAuthenticatedOrReadOnly`.

None of them:

* Restrict `update`/`destroy` to the project creator or team members.

* Use an owner‑aware permission class.

* Filter the queryset to objects owned by or related to the current user.

Concrete consequences:

* Any authenticated user who knows an object ID can:

  * Edit or delete **any project**, including changing its `status` to `validated` etc.

  * Modify or delete **any resource file**, including others’ uploads.

  * Edit/delete **tasks**, **messages**, **team memberships**, and **ratings** for projects they do not belong to.

This is a major security bug (broken authorization).

Critical‑priority fix:

* Introduce a shared `IsProjectOwnerOrTeamMember` permission (or equivalent per model) and apply it to update/delete actions.

* For messages/ratings, at least require `obj.author == request.user` / `obj.user == request.user` to edit/delete.

* Optionally restrict `ProjectTeam` changes to project owners or admins.

**Bug 4 – ProjectResource can be “empty” (no file, no URL)**

`ProjectResource`:

* `file` is nullable and blank.

* `external_url` is blank allowed.

* `file_type` is required, but nothing ensures that at least one of `file` or `external_url` is present.

Serializer:

* No custom validation to enforce “file XOR external\_url” or “at least one must be provided”.

Result:

* You can create a resource that has no file and no URL – an essentially unusable row that will still show up in UI lists.

Medium‑priority fix: add serializer `validate` to enforce:

* Either `file` or `external_url` is required.

* Optionally disallow both at the same time.

**Bug 5 – Ratings and team memberships rely only on DB uniqueness for correctness**

`ProjectRating` and `ProjectTeam` have `unique_together (project, user)`.

* Serializers are plain `ModelSerializer`s; uniqueness is enforced via Django’s `UniqueTogetherValidator` at the serializer level, which should give 400 on duplicates.

* However, **no tests exist** to confirm this behaviour or the error messaging.

Bug risk:

* Changing the serializer (e.g. to use `fields = [...]` without `Meta.unique_together`) could silently remove the validator and revert to 500s on duplicate rows.

* Combined with Bug 3, a malicious user can create multiple ratings per user via direct DB manipulation if constraints/migrations ever drift.

Medium‑priority: add tests specifically for:

* “Second rating from the same user on same project returns 400, not 500.”

* “Second team membership for same user/project returns 400.”

---

### **2.3 Kollective\_Intelligence (expertise scores, smart votes)**

**Code summary**

* Models for expertise categories, scores, ethics score, score history, votes, modalities, emerging experts, vote results.

* `Vote` enforces `unique_together (user, target_type, target_id)`.

* `VoteViewSet` is a `ModelViewSet` with `IsAuthenticated` and filterable list; `perform_create` sets user.

**Bug 6 – Any authenticated user can edit/delete other users’ votes**

`VoteViewSet`:

* `permission_classes = [permissions.IsAuthenticated]`.

* `get_queryset` returns all votes (`Vote.objects.select_related("user").all()`), optionally filtered by URL parameters.

* There is no object‑level permission check (no `IsOwnerOrReadOnly` or per‑object filter).

Consequences:

* Any authenticated user can:

  * `PUT/PATCH/DELETE /api/kollective/votes/{id}/` on votes created by someone else.

  * Potentially alter vote history, which then corrupts the aggregated reputation/score logic.

Critical‑priority fix:

* Apply an owner‑only permission (similar to `IsOwnerOrReadOnly` used in Ethikos).

* Optionally scope `get_queryset` to `Vote.objects.filter(user=request.user)` for write operations.

**Risk – VoteResultViewSet exposure**

`VoteResultViewSet` is read‑only and currently “not wired” in `api_router.py`, but its code is ready.

* If later exposed, there is at least a gate of `IsAuthenticated` but no further restriction.

* Depending on domain rules, this could leak sensitive aggregated scores (low/medium risk, depending on product decisions).

Low‑priority: when wiring `VoteResultViewSet`, decide if results should be limited by e.g. `target_type` or user membership.

**Tests**

* No tests exist for vote creation, duplication prevention, or authorization behaviour.

High‑ROI tests:

* “User A cannot update/delete vote of user B.”

* “Duplicate vote (same target\_type/target\_id) returns 400, not 500.”

---

### **2.4 KonnectED (certifications, exams, offline packages, portfolios)**

**Code summary**

* Relatively rich models for certification paths, evaluations, peer validations, portfolios, knowledge resources, offline packages, etc. (details spread across `models.py` and migrations).

* Several viewsets have careful `get_queryset` that scopes to `request.user` (e.g. `EvaluationViewSet`, `PeerValidationViewSet`, `PortfolioViewSet`, `ExamAttemptViewSet`).

**Overall: fewer obvious bugs, more “missing tests”**

The certification/exam logic is more defensive than other modules:

* `EvaluationViewSet.create` validates `path_id` and gracefully handles bad `session_id`.

* `ExamAttemptViewSet` always scopes evaluations to `request.user`.

The main risk here is complexity without tests:

* `_compute_retry_cooldown`, `_get_pass_threshold`, metadata‑driven status logic, etc., are non‑trivial.

* There are no tests for:

  * “status \= scheduled/passed/failed” derivation.

  * “canRetry” and “nextRetryAt” behaviour.

  * Appeals / retries actions.

High‑ROI tests:

* Parameterized tests for different combinations of `raw_score`, `max_score`, thresholds, and retry metadata to ensure status flags and `canRetry` behave as expected.

* Tests for `ExamAttemptViewSet.retrieve` enforcing that users cannot access others’ evaluations by ID.

---

### **2.5 Kreative (artworks, galleries, collab sessions, traditions)**

**Code summary**

* Models for tags, artworks (with M2M through `ArtworkTag`), galleries (through `GalleryArtwork`), collab sessions, tradition entries, etc., with sane uniqueness/indexing.

* Serializers are straightforward; `TraditionEntrySerializer` marks approval fields read‑only.

* API views are basic `ModelViewSet`s with `IsAuthenticated` or `IsAuthenticatedOrReadOnly`.

**Bug 7 – Any authenticated user can approve/edit others’ tradition entries**

`TraditionEntryViewSet`:

* `permission_classes = [permissions.IsAuthenticatedOrReadOnly]`.

* Serializer marks `approved`, `approved_by`, `approved_at` as `read_only_fields`.

Two risks:

1. **Direct update**  
    The comment says: “Approval is handled by admins separately,” but there is no override of `update()` or object‑level permission.

   * Any authenticated user can `PATCH` or `PUT` another user’s `TraditionEntry` and change non‑approval fields (title, description, region, etc.).

   * If any future developer removes `approved` from the serializer’s `read_only_fields` by mistake, they instantly create a direct approval‑tampering vulnerability.

2. **No admin‑only approval path implemented in this module**

   * The natural permission rule (“only staff can approve”) is not enforced at the API level.

High‑priority fix:

* Add an owner‑only permission or restrict `update`/`destroy` to `submitted_by`.

* Add an explicit `approve` action guarded by `IsAdminUser` (or similar), instead of relying on field read‑only status.

**Bug 8 – Artwork and gallery updates not restricted to creator**

`KreativeArtworkViewSet` and `GalleryViewSet`:

* Require authentication for create/update, but there is no check that the user updating/deleting a record is the `artist`/`created_by`.

Effect:

* Any authenticated user can overwrite or delete any artwork or gallery, provided they know the ID.

High‑priority fix: apply an `IsOwnerOrReadOnly` permission keyed on `artist`/`created_by`.

**Tests**

* No tests at all for Kreative flows.

High‑ROI tests:

* Permissions: user A cannot edit/delete artwork/gallery of user B.

* M2M integrity: adding/removing tags via `ArtworkTag` and `GalleryArtwork` behaves as expected.

---

### **2.6 Trust, Moderation, Users**

**Trust**

* `Credential` model plus `CredentialSerializer` with a custom `create` method that attaches credentials to `request.user` and enforces a required `file` upload.

This is generally robust:

* It explicitly checks for authentication and for the presence of `document` (via `source="document"`).

* The `url` and `status` fields are computed, preventing tampering via payload.

Main risk here is **lack of tests** for upload workflows and file validation logic.

**Moderation**

* Moderation endpoints are explicitly admin‑only (`IsAdminUser`) and mostly read or update `ModerationEvent`/`ModerationDecision`/`AuditLogEntry` in a defensive way.

* The code guards against nonexistent fields when filtering (e.g. checks for `status` field existence before filtering).

No clear correctness bug; main missing piece is test coverage.

**Users**

* This is the only app with mature, detailed tests (admin, forms, models, views, tasks, API).

* No obvious bugs surfaced while scanning; the code is aligned with cookiecutter‑django patterns.

---

## **3\. Short “bug backlog” (prioritised)**

**P0 – Security / authorization**

1. KeenKonnect: any authenticated user can edit/delete any `Project`, `ProjectResource`, `ProjectTask`, `ProjectMessage`, `ProjectTeam`, `ProjectRating`, `Tag`.

2. Kollective\_Intelligence: any authenticated user can edit/delete any `Vote`.

3. Kreative: any authenticated user can edit/delete any `KreativeArtwork` or `Gallery`; tradition entries are not owner‑restricted.

**P1 – Correctness / error handling**

4. Ethikos `StanceViewSet.create` bypasses serializer; invalid `topic`/`value` can produce DB errors (500) instead of 400\.

5. Ethikos `ArgumentViewSet.perform_create` does `int(topic_in)` without guarding, leading to 500 on malformed inputs.

6. ProjectResource allows “empty” resources (no `file` and no `external_url`).

**P2 – Future‑breakage risks**

7. Duplicate `ethikos/views.py` with weaker permissions; mis‑wiring in URLs would silently weaken security.

8. Approval logic for `TraditionEntry` and other sensitive fields currently relies on serializer `read_only_fields` only; small refactors could re‑open a path for privilege escalation.

9. Complex exam/portfolio logic (`ExamAttemptViewSet`, retry cooldown, pass thresholds) is untested; future refactors could easily change behaviour without detection.

---

## **4\. Suggested test plan focused on bug reduction**

If you want to invest minimal effort for maximum bug reduction, I would prioritize:

1. **Permission tests (security)**

   * For each of: `Project*` viewsets, `VoteViewSet`, `Kreative*` viewsets, `TraditionEntryViewSet`:

     * “User A can create their own object.”

     * “User B cannot update or delete object owned by user A.”

2. **Validation / 4xx vs 5xx tests**

   * Ethikos:

     * Invalid stance value (e.g. `value=99`) returns 400, not 500\.

     * Malformed `topic` in arguments returns 400\.

   * KeenKonnect:

     * ProjectResource without `file` and `external_url` returns 400\.

   * Kollective\_Intelligence:

     * Duplicate vote from same user on same target returns 400\.

3. **Critical domain flows**

   * Exam registration & attempts:

     * `EvaluationViewSet.create` correctly handles unknown `path_id` and invalid `session_id`.

     * `ExamAttemptViewSet.retrieve` only returns evaluations for the current user.

   * Trust:

     * `CredentialSerializer.create` requires authentication and requires `file`.

This combination directly targets the most serious bugs and will quickly harden the system against both accidental breakage and malicious use.

# Axe 5

Here is a performance & scalability review focused on concrete bug‑shaped risks (things that can break, hang, or get stuck under load).

---

## **1\. Offline JSON export is unbounded and monolithic**

**Where**

`export_knowledge_resources_for_offline` in `konnaxion/konnected/tasks.py`.

It:

* Iterates over **all** `KnowledgeResource` rows (`objects.all().order_by("id").iterator()`).

* Builds a Python list `items` of all serialized resources.

* Writes a single pretty‑printed JSON file containing all items (`indent=2`).

**Why this is a bug at scale**

* Memory usage grows linearly with number of resources (`items` holds the whole dataset in RAM).

* For large libraries, this can easily exceed worker memory and trigger OOM kills.

* CPU and I/O are also O(N) with no limit or batching, so a big catalog can exceed the global Celery hard time limit (5 minutes) configured in settings.

* There is no row cap or configuration to limit export size; one mis‑click on “export everything” can take down a worker.

**Impact**

* Worker OOM → task killed, no file produced, hard to debug.

* If called via UI as a “background export”, user may never see a result and there is no retry logic.

**Mitigations**

* Stream directly to disk instead of building `items` in memory:

  * Use a JSON lines format (`one object per line`) or incremental writing (open file, write “\[”, then chunks, then “\]”).

* Add an explicit maximum number of rows (or total estimated size) for this export, analogous to `EXPORT_MAX_ROWS` used by Insights.

* Consider a “cursor” parameter (paged export) instead of “dump everything” in one go.

---

## **2\. OfflinePackage builder loads entire queryset into memory**

**Where**

`build_offline_package` task in `konnaxion/konnected/tasks.py`.

Key steps:

* Resolve candidates via `_select_resources_for_package(package)` → returns a queryset of `KnowledgeResource`.

* Immediately do `resources = list(qs)` (full evaluation).

* Then apply `_enforce_size_limit(resources, max_size_mb)` and sum `_estimate_resource_size_mb(r)` for all resources.

**Why this is a bug at scale**

* `list(qs)` reads the **entire filtered resource set** into RAM.

* The size limit is applied **after** loading them, so it does not protect memory use (only the final bundle contents).

* For a package whose filters effectively mean “all resources” or “all big videos”, this can blow up worker memory before you even enforce `max_size_mb`.

On top of that:

* Celery hard time limit is 300s and soft limit 60s.

* If building a large package takes longer, the worker may be killed abruptly. In that case:

  * `_set_package_status` will have set `status="building"` at the start.

  * The cleanup code in the `try/except` (which would set `"failed"` or `"ready"`) never runs.

  * The package remains stuck forever in `"building"` and will be **excluded from future auto‑sync** runs because `build_offline_packages_for_auto_sync` excludes `status="building"`.

This is a real “stuck forever” bug under heavy workloads.

**Mitigations**

* Replace `resources = list(qs)` with streaming \+ incremental size check:

  * Iterate `qs.iterator()` and accumulate until size limit reached; never keep more items in memory than needed.

* Move size enforcement **into the streaming loop** (stop collecting once limit is reached).

* For very large catalogs, consider:

  * Per‑package hard cap on `item_count`.

  * Smaller Celery subtasks (e.g. one task per partition of the queryset).

* Add safety around Celery time limits:

  * Either increase limits specifically for this task, or

  * Use `SoftTimeLimitExceeded` handling to mark the package as `"failed"` rather than leaving `"building"`.

---

## **3\. Auto‑sync can flood Celery with unbounded builds**

**Where**

`build_offline_packages_for_auto_sync` in `konnected/tasks.py`.

Logic:

* `qs = OfflinePackage.objects.all()`, then filter `auto_sync=True` if field exists.

* Exclude packages where `status="building"`.

* For each package in `qs.iterator()`, call `build_offline_package.delay(pkg.pk)`.

**Why this is a bug at scale**

* No rate limiting: if 1,000+ packages are `auto_sync=True`, one scheduler tick creates 1,000 Celery tasks at once.

* No sharding or batching: all builds hit the same worker pool.

* Combined with the heavy per‑task work from bug (2), this can:

  * Saturate worker concurrency.

  * Increase queue length and latency for unrelated tasks.

  * Increase the probability of hitting Celery time limits, producing more “stuck building” packages.

Also note the defensive “schema‑forward‑compatible” logic:

* If `auto_sync` field does not exist yet (earlier migration state), the code falls back to **all packages** (`qs.filter(auto_sync=True)` in `try/except`).

* In a misaligned environment (old DB, new code) this could unintentionally schedule **every** package on every run.

**Mitigations**

* Add a maximum number of packages per run (e.g. process first N ordered by `updated_at`).

* Consider using a timestamp or “next\_run\_at” on package so you do not rebuild too frequently.

* Add monitoring and alerting around queue length and build throughput.

* During schema transitions, prefer explicit feature flags rather than “if field missing → use all”.

---

## **4\. Moderation queue endpoint is unpaginated (O(N) response)**

**Where**

`ModerationQueueView` in `konnaxion/moderation/api_views.py`.

Key points:

* `pagination_class = None` → DRF returns the full queryset.

* `get_queryset` starts with `ModerationReport.objects.all()`, optional `status` filter, then orders by `-created_at`.

* `.list()` serializes **all** matching reports and wraps them into `{"items": [...]}`.

**Why this is a bug at scale**

* For a busy platform, moderation reports can easily reach tens of thousands of rows.

* This endpoint will then:

  * Load all reports into memory.

  * Serialize them one by one into JSON.

  * Send a huge response to the admin UI.

* Under those conditions, you will see:

  * Very slow responses or gunicorn timeouts.

  * High memory usage on web workers.

  * Potential 502/504 at the ingress level.

From the admin’s perspective, this is indistinguishable from “moderation panel is broken”.

**Mitigations**

* Re‑enable pagination using the same pattern as `AuditLogPagination`:

  * Page \+ pageSize query params, with a sane `max_page_size`.

* Optionally keep a separate “summary” endpoint returning only counts per status for quick dashboards.

* For compatibility with existing frontends:

  * Keep the `{ items: [...] }` wrapper but make `items` a page slice, plus metadata (`page`, `pageSize`, `total`).

---

## **5\. Audit log free‑text search does full table scans**

**Where**

`AuditLogListView` in `konnaxion/moderation/api_views.py`.

`get_queryset`:

* Starts from `AuditLogEntry.objects.all()`.

* Optional `severity` filter.

* If `q` is set:

  * Applies `Q(actor__icontains=q) | Q(action__icontains=q) | Q(target__icontains=q) | Q(entity__icontains=q)`.

* Applies dynamic `order_by(sort, "-id")` (where sort defaults to `-ts`).

**Why this is a bug at scale**

* `icontains` \+ text fields \+ no special index → Postgres will do sequential scans.

* Audit logs tend to grow very quickly (thousands to millions of rows).

* With large tables, free‑text search will become:

  * Very slow (seconds to minutes).

  * A source of lock and IO pressure for other queries.

When logs are large, admin search can time out, which the user will treat as a broken “Audit” feature.

**Mitigations**

* Add appropriate indexes:

  * Either functional indexes on `lower(actor)`, `lower(action)`, etc., or a `GIN`/`PG_trgm` index per column.

* Consider splitting high‑volume logs out into a dedicated logging stack (which your Insights docs already suggest for other analytics).

* Add a maximum time range or date filter for the query (e.g. default to last 30 days, require an explicit param to search “all time”).

---

## **6\. Filter failures in offline selection “fail open” and can explode package size**

**Where**

`_select_resources_for_package` helper in `konnected/tasks.py`.

Behaviour:

* Builds a base queryset `KnowledgeResource.objects.all().order_by("id")`.

* Applies filters based on fields on the `OfflinePackage`:

  * `include_types` → `type__in=...`.

  * Optional `subject_filter`, `level_filter`, `language_filter`.

* Any filter errors are silently swallowed (generic `except Exception: pass`) and the broader queryset is returned.

**Why this is a bug at scale**

* If an admin misconfigures a package (e.g. invalid `include_types` payload or mismatched model schema), the filter may raise, be swallowed, and the code will quietly **fall back to “all resources”**.

* Combined with bug (2), that means:

  * Very large set of resources loaded into RAM.

  * Massive manifest built and attached to the package.

  * High risk of Celery timeouts / OOM.

* From the admin’s point of view, they configured a “small filtered bundle” but get a huge, slow, sometimes failing package.

**Mitigations**

* Narrow exception handling:

  * Catch specific, expected errors (e.g. `FieldError`) and surface them as validation errors on the package instead of silently ignoring.

* Add “safety rails”:

  * If filter is invalid → mark package as `"failed"` with a clear `last_error_message` instead of reverting to unfiltered `qs`.

* Log the effective number of candidates early, and optionally cap it.

---

## **7\. Time‑limit vs. heavy Celery tasks: stuck statuses**

**Where**

* Celery settings in `config/settings/base.py`.

* Offline tasks in `konnected/tasks.py`.

**Problem**

* `CELERY_TASK_TIME_LIMIT = 5 * 60` and `CELERY_TASK_SOFT_TIME_LIMIT = 60`.

* `build_offline_package` and `export_knowledge_resources_for_offline` are potentially long‑running tasks (full library scans \+ JSON writes).

* None of these tasks handle `SoftTimeLimitExceeded` explicitly.

If the task exceeds the soft limit:

* Celery raises `SoftTimeLimitExceeded` inside the task.

* Your generic `except Exception` blocks will catch it and mark the package as `"failed"`, which is good for the hard failure case.

But if the task exceeds the **hard** time limit:

* The worker is killed without any Python‑level cleanup.

* Package remains in `"building"` (set just once at the top), never goes to `"ready"` or `"failed"`.

* Auto‑sync explicitly skips `"building"` packages, so they never get retried.

**Mitigations**

* Raise `CELERY_TASK_TIME_LIMIT` for these heavy tasks (separate queue with higher limits).

* Or, redesign the build/export tasks to be chunked and fast:

  * Split the package build into multiple incremental tasks (each under \~30–60 seconds).

* Add a “watchdog” or periodic job that:

  * Finds packages in `"building"` for longer than X minutes.

  * Marks them `"failed"` with a timeout error so they can be retried.

---

If you want, next step could be: pick one of these (for example offline packages) and design a concrete test plan \+ stress scenario to try to reproduce the failure locally (e.g., seed 100k `KnowledgeResource` rows and run the tasks).

# Axe 6

# **DevOps / Observability / Resilience review – bug‑focused (axis 6\)**

1. Environment selection: inconsistent defaults (real risk of running “local” in prod)

---

**What the code does**

* `wsgi.py` defaults to **production** settings:  
   `os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")`.

* `asgi.py`, `celery_app.py` and `manage.py` all default to **local** settings:  
   `os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")`.

* `config/settings/local.py` forces `DEBUG = True` and enables dev‑only tools (debug toolbar, local Mailpit, etc.).

**Bug / failure modes**

* Any ASGI deployment (e.g. `uvicorn config.asgi:application`) that does **not** set `DJANGO_SETTINGS_MODULE` will run with **local** settings in production:

  * `DEBUG=True`

  * `LocMemCache` instead of Redis

  * Debug toolbar and dev middleware enabled

* Any Celery worker/beat started as `celery -A config.celery_app worker` outside Docker, or with a misconfigured `/start-celeryworker`, will also default to `config.settings.local`.

This creates an easy “foot‑gun”: WSGI runs correctly in production, but Celery and ASGI can silently use dev settings.

**Concrete fix**

* Make all entry points consistent and prod‑safe by default:

  * Change `asgi.py`, `celery_app.py`, `manage.py` to default to **production**, not local:  
     `os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.production")`.

  * Or better: **never** default to local in library/entry files; enforce `DJANGO_SETTINGS_MODULE` via Docker env (`.envs/.local/.django`, `.envs/.production/.django`) and CI.

* Keep `config.settings.local` for manage‑dev commands via a `.env` variable (`DJANGO_SETTINGS_MODULE=config.settings.local`) instead of hard‑coding it in code.

2. Required env vars with no defaults – app fails hard if forgotten

---

In `config/settings/production.py` several values are read with **no default**:

* `SECRET_KEY = env("DJANGO_SECRET_KEY")`

* `ADMIN_URL = env("DJANGO_ADMIN_URL")`

* `SENTRY_DSN = env("SENTRY_DSN")`

If any of these are missing in `.envs/.production/.django`, Django will crash at import time (`ImproperlyConfigured`) and the container never starts.

**This is not wrong in itself**, but in practice it’s an easy source of “works locally, fails in prod” bugs because:

* The **Global Parameter Reference**’s env‑matrix lists core env vars (e.g. `DJANGO_SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, etc.) but does **not** mention `DJANGO_ADMIN_URL` or `SENTRY_DSN`.

**Concrete fix**

* Add `DJANGO_ADMIN_URL` and `SENTRY_DSN` (plus `DJANGO_SENTRY_LOG_LEVEL` if you rely on it) to the env‑matrix and template files (`.envs/.production/.django`).

* Optionally:

  * Provide safer defaults for non‑critical things:

    * `SENTRY_DSN = env("SENTRY_DSN", default="")` and guard `sentry_sdk.init` behind `if SENTRY_DSN:`.

  * Keep “hard required” only for truly critical secrets (`DJANGO_SECRET_KEY`).

3. Docker & database/backups: backup volume defined but never used

---

**Production docker-compose**

`postgres` has both a data volume and a `production_postgres_data_backups` volume mounted at `/backups`.

 postgres:  
  ...  
  volumes:  
    \- production\_postgres\_data:/var/lib/postgresql/data  
    \- production\_postgres\_data\_backups:/backups

*   
* There is **no backup job/service** defined in `docker-compose.production.yml` to actually write anything into `/backups`.

**Bug / failure modes**

* Gives a strong **illusion of backups** (“there’s a `*_backups` volume, so we must be fine”) while in reality nothing writes there.

* In a disaster, you discover you only had the primary data volume and no logical backups / snapshots.

**Concrete fix**

* Either:

  * Remove the `production_postgres_data_backups` volume to avoid false confidence,

  * Or add an explicit backup mechanism:

    * A small `dbbackup` service using `pg_dump` to `/backups` on cron or via external scheduler.

    * Or document an operational playbook that mounts this volume into a backup job (Kubernetes CronJob, etc).

4. Local dev uses Neon DB; tests likely share it (data corruption risk)

---

**Local docker-compose**

* `docker-compose.local.yml` deliberately **removes the local postgres** service and comments:  
   `# ❌ REMOVED local postgres — you now use NEON`.

* The `django` service loads `.envs/.local/.django` and `.envs/.local/.postgres`, the latter “contains only DATABASE\_URL for Neon”.

* `config/settings/base.py` reads `DATABASE_URL` from env and uses it for **all environments**, including `test` (via `config.settings.test`).

* `pytest` is configured to run with `--ds=config.settings.test --reuse-db`.

**Bug / failure modes**

* If your CI / local tests run with the same `DATABASE_URL` as dev:

  * Tests will hit the **same Neon database** used by local dev.

  * `--reuse-db` will keep reusing that DB; destructive tests can wipe or mutate dev data.

* There is no separate test DB URL in the env matrix or settings.

**Concrete fix**

* Introduce a dedicated test DB env var and mapping, e.g.:

  * Add `TEST_DATABASE_URL` to env matrix and `.envs/.local/.django`.

In `config/settings/test.py`:

 from .base import \*  \# noqa  
DATABASES \= {"default": env.db("TEST\_DATABASE\_URL")}

*   
* In CI, always supply `TEST_DATABASE_URL` (separate Neon DB or local Postgres) and never reuse dev DB.

5. Logging & Sentry: potential gaps and misconfigurations

---

**Current setup**

* Base logging config writes verbose logs to `stdout` and leaves existing loggers enabled.

* Production overrides logging with `disable_existing_loggers=True` and only keeps a few explicit loggers (`django.db.backends`, `sentry_sdk`, `django.security.DisallowedHost`) plus root.

* Celery connects a signal (`@setup_logging.connect`) to apply Django’s `LOGGING` config inside workers, with `CELERY_WORKER_HIJACK_ROOT_LOGGER = False`.

**Bug / failure modes**

* `disable_existing_loggers=True` may **silence third‑party loggers** that are configured earlier (e.g. libraries that configure their own loggers). Some may stop emitting logs unless you explicitly re‑add them.

* Sentry bootstrapping is all‑or‑nothing:

  * As noted, `SENTRY_DSN` has no default. A missing or invalid DSN will cause app startup failure, instead of just “no Sentry, but app runs”.

**Concrete fix**

* Consider setting `disable_existing_loggers=False` in production too, unless you have a specific reason to kill all other loggers.

Guard Sentry init:

 SENTRY\_DSN \= env("SENTRY\_DSN", default="")  
if SENTRY\_DSN:  
    sentry\_sdk.init(...)

*  so a missing DSN degrades observability but does not block deployments.

6. Celery / Redis configuration gotchas

---

**Config**

* Celery uses Redis for both broker and result backend (`CELERY_BROKER_URL = REDIS_URL`, `CELERY_RESULT_BACKEND = REDIS_URL`).

* SSL for Redis (`rediss://`) is configured with `ssl_cert_reqs=ssl.CERT_NONE`.

* Hard/soft time limits are set globally: `CELERY_TASK_TIME_LIMIT = 5 * 60`, `CELERY_TASK_SOFT_TIME_LIMIT = 60`.

**Bug / failure modes**

* If you ever switch to `rediss://` in production, you’re explicitly **disabling certificate verification** (`CERT_NONE`). That’s a security bug rather than a stability issue.

* The 60‑second soft time limit may be too low for heavier tasks (e.g. offline package build, large ETL jobs), causing `SoftTimeLimitExceeded` and silent partial failures if those exceptions are not handled carefully.

**Concrete fix**

* For Redis over TLS:

  * Use proper CA certificates and `ssl_cert_reqs=ssl.CERT_REQUIRED` in production config.

* For Celery:

  * Either tune `CELERY_TASK_SOFT_TIME_LIMIT` per queue/task, or make the global value more conservative until you know real task profiles.

7. Observability surface: Flower/Traefik wiring

---

* In production compose, `traefik` exposes port `5555`, and a `flower` service exists, but `flower` has no ports or Traefik labels; only `traefik` is exposed.

**Bug / failure modes**

* It is easy to assume that `:5555` on the host serves Flower, but in reality it serves Traefik itself unless separate routing is configured.

* Without the Traefik routing config (labels or static config), Flower may be unreachable, undermining Celery observability.

**Concrete fix**

* Either:

  * Expose Flower directly with a port mapping (and secure it by network ACL / VPN), or

  * Add explicit Traefik labels to route `/flower` or `:5555` to the Flower container. Document this in the deploy notes.

## **Prioritised “prod‑ready” bug‑fix checklist (axis‑6, bug‑centric)**

1. Make all entrypoints (ASGI, Celery, manage.py) prod‑safe by default – remove hard‑coded `config.settings.local`.

2. Add missing required env vars (especially `SENTRY_DSN`, `DJANGO_ADMIN_URL`) to env templates and docs; decide which are hard‑required vs optional.

3. Implement an actual Postgres backup job or remove the unused backups volume.

4. Introduce a separate test database (`TEST_DATABASE_URL`) to avoid tests sharing the Neon dev DB.

5. Relax/guard Sentry init and reconsider `disable_existing_loggers=True` to avoid silencing important logs.

6. Fix Redis TLS config (no `CERT_NONE` in prod) and review Celery time limits for long‑running tasks.

7. Wire Flower correctly behind Traefik (or expose it explicitly) so Celery observability tools actually work.


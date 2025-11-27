### Konnaxion v14 – Insights Module UI Spec (Reporting & Analytics Front-end)
(English translation)

### 1. Scope
### Describes every React user interface that lets users view global analytics metrics: Smart Vote, project activity, auth performance, overall adoption. Only read-only views are covered here; ingestion and computation belong to layers 5.2 – 5.4.

### 2. Routes & Navigation
### The “Insights” sidebar opens from the chart icon in the main layout (section 0.1).

### 3. Primary Components
### All components follow the design-token palette (0.1 §2); no hard-coded colors.

### 4. State & Data Handling
### React Query 5
### useReport(endpoint, params) (5-minute cache, or shorter if auto-refresh is on).
### Cache invalidated on time-range change.
### WebSocket (custom page): hook useReportStream() (channel group reports_user_<id>).
### Redux not required—local navigation via context.

### 5. User Flow – Smart Vote
### sequenceDiagram
### U->>F: Open /reports/smart-vote
### F->>API: GET /reports/smart-vote?range=30d
### API-->>F: JSON dataset
### F-->>U: Charts render
### U->>F: Change range → 7d
### F->>API: GET /reports/smart-vote?range=7d  (cached?)
### API-->>F: JSON
### Target UI latency: < 200 ms (chart displayed after response).

### 6. Accessibility & i18n
### Each chart is paired with an aria-labelledby table for screen-reader support.
### Colors checked against WCAG AA.
### All labels reside in the reports namespace.

### 7. Testing
### Goal: ≥ 90 % line coverage.

### 8. Dependencies
### Chart.js 4 (tree-shaken import).
### Ant Design 5 for forms / pickers.
### No additional third-party state library beyond React Query.

### 9. Folder Structure
### /packages/reports-frontend
### /components
### SmartVoteChart.tsx
### UsageBigNumbers.tsx
### DomainHeatMap.tsx
### LatencySLOGauge.tsx
### ErrorRateSparkline.tsx
### TimeRangePicker.tsx
### /pages
### InsightsHomePage.tsx
### SmartVoteDashboard.tsx
### UsageDashboard.tsx
### PerfDashboard.tsx
### CustomBuilderPage.tsx
### hooks/
### useReport.ts
### useReportStream.ts
### index.ts
### Build output: @konnaxion/reports-ui (ESM + types).


### Reporting & Analytics · Backend layer
(service reports‑api aligned with Konnaxion Technical Specification v14; complements Frontend 5.1 and DevOps 5.4)

#### 1 . Scope
reports‑api is a read‑only micro‑service that exposes pre‑aggregated analytics produced nightly (and, for some metrics, near‑real‑time).
 It does not write business data; it reads star‑schema tables managed by the ETL pipelines defined in layer 5.4.

#### 2 . Technology stack

#### 3 . Data contracts (OpenAPI excerpts)
All time ranges must be ≤ 90 days; otherwise API returns 400 INVALID_RANGE.

#### 4 . Database schema (read‑only star)
Fact tables (managed by ETL):
smart_vote_fact (grain vote × question × date) – correctif 5.3
usage_mau_fact (user × month)
api_perf_fact (endpoint × hour)
Dim tables: dim_date, dim_domain, dim_endpoint.
Indices are column‑store (PG16 zstd compression). Views vw_smart_vote_30d, vw_usage_90d, vw_perf_24h simplify queries.

#### 5 . Caching & invalidation policy
Key pattern reports:{endpoint}:{sha256(params)}.
Spring‑cleaner Celery task purges keys older than 12 h.
Export route sets Content‑Disposition: attachment; filename="report_<type>_<date>.csv".

#### 6 . Permissions & audit
Only users with role ADMIN or higher may call /reports/export.
Each call adds entry to audit_request_log (user_id, path, ip, ts).
No PII leaves the service; results are aggregated ≥ 10 records (k‑anonymity).

#### 7 . Error codes (JSON Error format 0.2)

#### 8 . Performance targets (SLO for API only)
Latency measured post‑cache miss (worst case).

#### 9 . Unit of work sequence (Smart Vote)
sequenceDiagram
U->>API: GET /reports/smart-vote?range=7d
API->>Redis: GET key
alt cache hit
Redis-->>API: dataset
else cache miss
Redis-->>API: null
API->>DB: SELECT * FROM vw_smart_vote_30d WHERE date >= now()-7d
DB-->>API: rows
API->>Redis: SET key TTL 600
end
API-->>U: 200 JSON


#### 10 . Tests & quality gate
Unit: serializers, range‑validation, cache decorator.
Integration: query → db snapshot → compare JSON.
Contract: Dredd against OpenAPI on CI.
Load: k6 200 RPS sustained ; p95 < 300 ms with Redis hot.

#### 11 . Dependencies
Python 3.12, Django 4.2, DRF 3.15
Redis‑py 5, psycopg 3
django‑redis‑cache with TLS.


### Document 5.3 – Reporting & Analytics · Database & Storage layer
(star‑schema schema for the “Insights” module, aligned with v14)

#### 1 . Scope
Defines all relational objects that power read‑only analytics served by reports‑api (5.2): fact tables, dimensions, materialised views, indexes, retention and ETL interfaces.
 This schema is deployed on the dedicated analytical PostgreSQL 16 cluster (separate from OLTP).

#### 2 . Star‑schema overview
┌──────────────┐
│  dim_date    │
└─────┬────────┘
│    (FK)
┌──────────────────────────────────────────────────────────┐
│                  Fact tables (grain)                    │
├──────────────────────────────────────────────────────────┤
│ smart_vote_fact      vote × question × date             │
│ usage_mau_fact       user × month                       │
│ api_perf_fact        endpoint × hour                    │
└──────────────────────────────────────────────────────────┘
│
┌─────────┴─────────┐
│  other dimensions │
└───────────────────┘


#### 3 . Core dimension tables
All dims are static, SMALLINT / surrogate keys, and compressed with ENCODING zstd.

#### 4 . Fact tables (partitioned by date)
##### 4.1 smart_vote_fact
Partition : monthly by date_id.
 Index : (domain_id, date_id) BRIN.
 ETL task etl_smart_vote (5.4) writes nightly + delta every 10 min.

##### 4.2 usage_mau_fact
Partition by year (range).
 Index (month_id, domain_id) B‑tree.

##### 4.3 api_perf_fact
Partition by month via date_id.
 Index (endpoint_id, date_id, hour_of_day).

#### 5 . Materialised views
All views use WITH NO DATA in migration; first population by Airflow DAG.

#### 6 . Migration order (extract)
006_dim_core.sql – creates dim_date, dim_domain, dim_endpoint, seeds calendar.
007_fact_smart_vote.sql
008_fact_usage_mau.sql
009_fact_api_perf.sql
010_mat_views_reports.sql – defines & indexes materialised views.

#### 7 . Retention & purge

#### 8 . Security & PII rules
user_id in facts is hashed with SHA‑256(secret) to ensure irreversibility.
ETL discards rows where cohort < 10 (k‑anonymity).
DB role reports_reader has SELECT only on materialised views and dims; fact tables restricted to ETL service account.

#### 9 . Performance baselines
Query SELECT * FROM vw_perf_24h WHERE endpoint_id = X returns ≤ 50 ms P95.
Monthly partition attach/detach < 2 s (tested on 100 M rows smart_vote).

All analytical storage objects required for the Reporting & Analytics slice are now specified without ambiguities and align with service (5.2) and UI (5.1) contracts.

### Document 5.4 – Reporting & Analytics · DevOps / Infrastructure layer
(infrastructure for reports‑api and analytics ETL, aligned with Konnaxion Tech Spec v14)

#### 1 . Objective
Specify all Kubernetes manifests, Airflow jobs, environment variables, alert rules and backup policies required to operate the Reporting & Analytics slice (layer 5).
 Everything common (Ingress, Vault, Prometheus, GH Actions pipeline skeleton) is defined in Document 0.4; here we only describe module‑specific additions.

#### 2 . Runtime components
HPA for reports-api triggers on CPU > 60 % or latency P95 > 400 ms (Prometheus custom metric).

#### 3 . Airflow DAGs (mounted in /opt/airflow/dags)
Airflow connections (pg_analytics, redis_reports) are injected via Vault secrets backend.

#### 4 . Environment variables & secrets
Secrets injected by CSI Vault; ConfigMap mounted read‑only.

#### 5 . CI/CD extensions
Build push tags images reports-api and reports-etl; Argo CD auto‑sync to staging, then manual promote prod.

#### 6 . Prometheus metrics & alerts
Dashboards reports-api.json and report-etl.json show throughput, cache hit rate, ETL runtime.

#### 7 . Runbooks
High API latency → scale reports-api (check HPA), inspect slow query log on analytics PG.
ETL failure → Airflow UI → retry task; if database lock, run SELECT * FROM pg_locks and kill blocking PID.
Mat view refresh over 60 s → vacuum partition, review index bloat.
Redis miss flood → increase maxmemory, verify cache key churn.

#### 8 . Backup & disaster recovery
Quarterly restore‑drill: restore analytics snapshot to staging and run sample /reports queries.

#### 9 . Security & compliance
All facts store hashed user IDs (see 5.3).
Role reports_reader is enforced via Postgres search_path and RLS OFF.
API export limited to 100 k rows and only for ADMIN role.
Audit log (audit_request_log) shipped via Fluent Bit to OpenSearch; retention 6 months.

#### 10 . SLO mapping

All Reporting & Analytics infrastructure elements are now fully specified: deployments, Airflow DAGs, variables, monitoring and recovery procedures, completing the layer 5 documentation set.

### **Konnaxion v14 – Insights Module UI Spec (Reporting & Analytics Front-end)** *(English translation)*

### ---

### **1\. Scope**

### Describes every React user interface that lets users view global analytics metrics: **Smart Vote**, project activity, auth performance, overall adoption. Only **read-only** views are covered here; ingestion and computation belong to layers 5.2 – 5.4.

### ---

### **2\. Routes & Navigation**

| Route | Page | Description | Consumed API(s) |
| :---- | :---- | :---- | :---- |
| /reports | InsightsHomePage | Card hub: Smart Vote, Activity, API Health | — |
| /reports/smart-vote | SmartVoteDashboard | Voting trends & correlations | GET /reports/smart-vote |
| /reports/usage | UsageDashboard | MAU / projects / docs per domain | GET /reports/usage |
| /reports/perf | PerfDashboard | Latency & error SLOs | GET /reports/perf |
| /reports/custom | CustomBuilderPage | *(beta)* query-builder | WebSocket /ws/reports/custom |

### The **“Insights”** sidebar opens from the chart icon in the main layout (section 0.1).

### ---

### **3\. Primary Components**

| Component | Role | Graphics Lib |
| :---- | :---- | :---- |
| \<SmartVoteChart\> | Bar \+ line mixed chart, dual axes (votes & score) | Chart.js 4 |
| \<UsageBigNumbers\> | Three cards: “Projects / Docs / Active users” | Tailwind utilities |
| \<DomainHeatMap\> | Heat map: docs × domains | Chart.js matrix |
| \<LatencySLOGauge\> | P95 latency vs SLO gauge | Chart.js doughnut |
| \<ErrorRateSparkline\> | 24 h error-rate sparkline | Chart.js line |
| \<TimeRangePicker\> | Absolute / relative picker (24 h, 7 d, 30 d) | AntD RangePicker |
| \<ExportCSVButton\> | Downloads current dataset (?format=csv) | — |

### All components follow the design-token palette (0.1 §2); **no hard-coded colors**.

### ---

### **4\. State & Data Handling**

### **React Query 5**

* ### useReport(endpoint, params) (5-minute cache, or shorter if auto-refresh is on).

* ### Cache invalidated on time-range change.

* ### **WebSocket** (custom page): hook useReportStream() (channel group reports\_user\_\<id\>).

* ### **Redux not required**—local navigation via context.

### ---

### **5\. User Flow – Smart Vote**

### sequenceDiagram

### U-\>\>F: Open /reports/smart-vote

### F-\>\>API: GET /reports/smart-vote?range=30d

### API--\>\>F: JSON dataset

### F--\>\>U: Charts render

### U-\>\>F: Change range → 7d

### F-\>\>API: GET /reports/smart-vote?range=7d  (cached?)

### API--\>\>F: JSON

### Target UI latency: **\< 200 ms** (chart displayed after response).

### ---

### **6\. Accessibility & i18n**

* ### Each chart is paired with an aria-labelledby table for screen-reader support.

* ### Colors checked against **WCAG AA**.

* ### All labels reside in the reports namespace.

### ---

### **7\. Testing**

| Level | Coverage |
| :---- | :---- |
| Unit | Axis calculations, “no data” fallback |
| Integration | API fetch, cache invalidation, time-range picker |
| e2e | Home → Smart Vote → CSV export |

### Goal: **≥ 90 %** line coverage.

### ---

### **8\. Dependencies**

* ### **Chart.js 4** (tree-shaken import).

* ### **Ant Design 5** for forms / pickers.

* ### No additional third-party state library beyond React Query.

### ---

### **9\. Folder Structure**

### /packages/reports-frontend

###   /components

###     SmartVoteChart.tsx

###     UsageBigNumbers.tsx

###     DomainHeatMap.tsx

###     LatencySLOGauge.tsx

###     ErrorRateSparkline.tsx

###     TimeRangePicker.tsx

###   /pages

###     InsightsHomePage.tsx

###     SmartVoteDashboard.tsx

###     UsageDashboard.tsx

###     PerfDashboard.tsx

###     CustomBuilderPage.tsx

###   hooks/

###     useReport.ts

###     useReportStream.ts

###   index.ts

### Build output: **@konnaxion/reports-ui** (ESM \+ types).

### ---

### **Reporting & Analytics · Backend layer**

*(service **`reports‑api`** aligned with Konnaxion Technical Specification v14; complements Frontend 5.1 and DevOps 5.4)*

---

#### **1 . Scope**

`reports‑api` is a **read‑only micro‑service** that exposes pre‑aggregated analytics produced nightly (and, for some metrics, near‑real‑time).  
 It **does not** write business data; it reads star‑schema tables managed by the ETL pipelines defined in layer 5.4.

---

#### **2 . Technology stack**

| Aspect | Decision |
| ----- | ----- |
| Framework | Django 4.2 \+ Django REST Framework 3.15 |
| ORM / DB | Read‑only PostgreSQL 16 (analytical cluster, separate from OLTP) |
| Caching | Redis 7 (TTL 600 s default) |
| Asynchronous refresh | Airflow 2.9 DAGs (see 5.4) |
| Auth | Same JWT middleware as Core 0.2; all endpoints require `IsAuthenticated` |
| Rate limit | 60 req/min per user (`UserRateThrottle`) |

---

#### **3 . Data contracts (OpenAPI excerpts)**

| Endpoint | Method | Query params | Response 200 | Cache TTL |
| ----- | ----- | ----- | ----- | ----- |
| `/reports/smart-vote` | **GET** | `range` (`24h`,`7d`,`30d`,`custom`), `grouping` (`day`/`week`) | `{labels[], votes[], avg_score[]}` | 600 s |
| `/reports/usage` | **GET** | `range`, `grouping`, `domain_code?` | `{labels[], mau[], projects[], docs[]}` | 600 s |
| `/reports/perf` | **GET** | `range`, `endpoint?` (`/auth/login`, …) | `{labels[], p95_latency[], error_rate[]}` | 300 s |
| `/reports/export` | **GET** | `report` (`smart-vote`, `usage`, `perf`), `format` (`csv`,`json`), same filters as source | File stream | 60 s |

*All time ranges must be ≤ 90 days; otherwise API returns `400 INVALID_RANGE`.*

---

#### **4 . Database schema (read‑only star)**

* **Fact tables** (managed by ETL):

  * `smart_vote_fact` (grain vote × question × date) – correctif 5.3

  * `usage_mau_fact` (user × month)

  * `api_perf_fact` (endpoint × hour)

* **Dim tables**: `dim_date`, `dim_domain`, `dim_endpoint`.

Indices are column‑store (PG16 `zstd` compression). Views `vw_smart_vote_30d`, `vw_usage_90d`, `vw_perf_24h` simplify queries.

---

#### **5 . Caching & invalidation policy**

* Key pattern `reports:{endpoint}:{sha256(params)}`.

* Spring‑cleaner Celery task purges keys older than 12 h.

* Export route sets `Content‑Disposition: attachment; filename="report_<type>_<date>.csv"`.

---

#### **6 . Permissions & audit**

* Only users with role `ADMIN` or higher may call `/reports/export`.

* Each call adds entry to `audit_request_log` (user\_id, path, ip, ts).

* No PII leaves the service; results are aggregated ≥ 10 records (k‑anonymity).

---

#### **7 . Error codes (JSON Error format 0.2)**

| Code | HTTP | Meaning |
| ----- | ----- | ----- |
| `INVALID_RANGE` | 400 | Range \> 90 days or start \> end |
| `UNSUPPORTED_FORMAT` | 400 | Format ≠ `csv`,`json` |
| `ENDPOINT_UNKNOWN` | 400 | Perf endpoint filter invalid |
| `EXPORT_FORBIDDEN` | 403 | Role \< ADMIN |

---

#### **8 . Performance targets (SLO for API only)**

| Path | P95 Latency | Error rate |
| ----- | ----- | ----- |
| `GET /reports/smart-vote` | ≤ 400 ms | ≤ 1 % |
| `GET /reports/usage` | ≤ 400 ms | ≤ 1 % |
| `GET /reports/perf` | ≤ 400 ms | ≤ 1 % |
| `GET /reports/export` | ≤ 800 ms | ≤ 1 % |

Latency measured post‑cache miss (worst case).

---

#### **9 . Unit of work sequence (Smart Vote)**

sequenceDiagram  
U-\>\>API: GET /reports/smart-vote?range=7d  
API-\>\>Redis: GET key  
alt cache hit  
  Redis--\>\>API: dataset  
else cache miss  
  Redis--\>\>API: null  
  API-\>\>DB: SELECT \* FROM vw\_smart\_vote\_30d WHERE date \>= now()-7d  
  DB--\>\>API: rows  
  API-\>\>Redis: SET key TTL 600  
end  
API--\>\>U: 200 JSON

---

#### **10 . Tests & quality gate**

* **Unit**: serializers, range‑validation, cache decorator.

* **Integration**: query → db snapshot → compare JSON.

* **Contract**: Dredd against OpenAPI on CI.

* **Load**: k6 200 RPS sustained ; p95 \< 300 ms with Redis hot.

---

#### **11 . Dependencies**

* Python 3.12, Django 4.2, DRF 3.15

* Redis‑py 5, psycopg 3

* `django‑redis‑cache` with TLS.

---

### **Document 5.3 – Reporting & Analytics · Database & Storage layer**

*(star‑schema schema for the “Insights” module, aligned with v14)*

---

#### **1 . Scope**

Defines **all relational objects** that power read‑only analytics served by `reports‑api` (5.2): fact tables, dimensions, materialised views, indexes, retention and ETL interfaces.  
 This schema is deployed on the dedicated **analytical PostgreSQL 16 cluster** (separate from OLTP).

---

#### **2 . Star‑schema overview**

                    ┌──────────────┐  
                     │  dim\_date    │  
                     └─────┬────────┘  
                           │    (FK)  
┌──────────────────────────────────────────────────────────┐  
│                  Fact tables (grain)                    │  
├──────────────────────────────────────────────────────────┤  
│ smart\_vote\_fact      vote × question × date             │  
│ usage\_mau\_fact       user × month                       │  
│ api\_perf\_fact        endpoint × hour                    │  
└──────────────────────────────────────────────────────────┘  
                           │  
                 ┌─────────┴─────────┐  
                 │  other dimensions │  
                 └───────────────────┘

---

#### **3 . Core dimension tables**

| Table | Key(s) | Columns (relevant) | Notes |
| ----- | ----- | ----- | ----- |
| **`dim_date`** | `date_id` (INT) | calendar\_date, year, month, week, day, iso\_week | Pre‑populated 2000‑01‑01 … 2035‑12‑31 |
| **`dim_domain`** | `domain_id` | `domain_code ENUM(domain_code)` | Maps to OLTP domain codes |
| **`dim_endpoint`** | `endpoint_id` | `path VARCHAR(80)` | Enumerates tracked REST paths |

All dims are static, SMALLINT / surrogate keys, and compressed with `ENCODING zstd`.

---

#### **4 . Fact tables (partitioned by date)**

##### **4.1 `smart_vote_fact`**

| Column | Type | Comment |
| ----- | ----- | ----- |
| `id` | UUID PK |  |
| `date_id` | INT FK `dim_date` |  |
| `domain_id` | INT FK `dim_domain` |  |
| `question_id` | UUID |  |
| `user_id` | UUID (*hash‑anonymised*) |  |
| `vote_value` | NUMERIC(5,2) |  |
| `score_normalised` | NUMERIC(5,2) |  |

*Partition* : monthly by `date_id`.  
 *Index* : `(domain_id, date_id)` BRIN.  
 ETL task **`etl_smart_vote`** (5.4) writes nightly \+ delta every 10 min.

---

##### **4.2 `usage_mau_fact`**

| Column | Type |
| ----- | ----- |
| `id` UUID PK |  |
| `month_id` INT FK `dim_date` (first day of month) |  |
| `domain_id` INT FK `dim_domain` |  |
| `mau` INT |  |
| `projects_created` INT |  |
| `docs_uploaded` INT |  |

Partition by year (range).  
 Index `(month_id, domain_id)` B‑tree.

---

##### **4.3 `api_perf_fact`**

| Column | Type |
| ----- | ----- |
| `id` UUID PK |  |
| `date_id` INT FK `dim_date` |  |
| `hour_of_day` SMALLINT (0‑23) |  |
| `endpoint_id` INT FK `dim_endpoint` |  |
| `p95_latency_ms` INT |  |
| `error_rate_pct` NUMERIC(4,2) |  |
| `request_count` BIGINT |  |

Partition by month via `date_id`.  
 Index `(endpoint_id, date_id, hour_of_day)`.

---

#### **5 . Materialised views**

| View | Definition (summary) | Refresh |
| ----- | ----- | ----- |
| `vw_smart_vote_30d` | Aggregates `smart_vote_fact` last 30 days (sum votes, avg score) | On‑demand via `reports‑api`; ETL triggers incremental refresh |
| `vw_usage_90d` | Rolling MAU / docs / projects, grouped daily | Nightly 02:00 UTC |
| `vw_perf_24h` | P95 & error‑rate per endpoint last 24 h | Every 15 min |

All views use `WITH NO DATA` in migration; first population by Airflow DAG.

---

#### **6 . Migration order (extract)**

1. `006_dim_core.sql` – creates `dim_date`, `dim_domain`, `dim_endpoint`, seeds calendar.

2. `007_fact_smart_vote.sql`

3. `008_fact_usage_mau.sql`

4. `009_fact_api_perf.sql`

5. `010_mat_views_reports.sql` – defines & indexes materialised views.

---

#### **7 . Retention & purge**

| Object | Retention | Mechanism |
| ----- | ----- | ----- |
| `smart_vote_fact` | 5 years partitions, then drop | Yearly drop oldest partition |
| `usage_mau_fact` | 10 years | Same |
| `api_perf_fact` | 2 years | Same |
| Materialised views | kept latest; auto‑refresh overwrites | — |

---

#### **8 . Security & PII rules**

* `user_id` in facts is hashed with SHA‑256(secret) to ensure irreversibility.

* ETL discards rows where cohort \< 10 (k‑anonymity).

* DB role `reports_reader` has `SELECT` only on materialised views and dims; fact tables restricted to ETL service account.

---

#### **9 . Performance baselines**

* Query `SELECT * FROM vw_perf_24h WHERE endpoint_id = X` returns ≤ 50 ms P95.

* Monthly partition attach/detach \< 2 s (tested on 100 M rows smart\_vote).

---

All analytical storage objects required for the Reporting & Analytics slice are now specified without ambiguities and align with service (5.2) and UI (5.1) contracts.

### **Document 5.4 – Reporting & Analytics · DevOps / Infrastructure layer**

*(infrastructure for **reports‑api** and analytics ETL, aligned with Konnaxion Tech Spec v14)*

---

#### **1 . Objective**

Specify **all Kubernetes manifests, Airflow jobs, environment variables, alert rules and backup policies** required to operate the Reporting & Analytics slice (layer 5).  
 Everything common (Ingress, Vault, Prometheus, GH Actions pipeline skeleton) is defined in Document 0.4; here we only describe module‑specific additions.

---

#### **2 . Runtime components**

| Resource | Image | Replicas / HPA | CPU m (req / lim) | RAM Mi (req / lim) |
| ----- | ----- | ----- | ----- | ----- |
| **Deployment `reports-api`** | `ghcr.io/konnaxion/reports-api:<sha>` | 3 (HPA 2 → 6) | 300 / 600 | 384 / 768 |
| **Deployment `reports-etl-worker`** | `ghcr.io/konnaxion/reports-etl:<sha>` | 2 (manual) | 400 / 800 | 512 / 1024 |
| **Airflow (`analytics-airflow`)** | `apache/airflow:2.9‑python3.12` | 1 scheduler, 2 workers | 250 / 500 | 512 / 1024 |
| **Job `reports-db-migrate`** | same as `reports-api` | run‑once on deploy | 250 | 256 |

HPA for `reports-api` triggers on **CPU \> 60 %** or **latency P95 \> 400 ms** (Prometheus custom metric).

---

#### **3 . Airflow DAGs (mounted in `/opt/airflow/dags`)**

| DAG id | Schedule | Task outline | Target |
| ----- | ----- | ----- | ----- |
| `etl_smart_vote` | `*/10 * * * *` | load OLTP deltas → `smart_vote_fact` | Analytics PG |
| `etl_usage` | `0 * * * *` | hourly MAU update | Analytics PG |
| `etl_perf` | `*/15 * * * *` | ingest Prometheus API perf → `api_perf_fact` | Analytics PG |
| `refresh_mat_views` | `5 * * * *` | REFRESH `vw_*` materialised views | Analytics PG |
| `cleanup_cache` | `@hourly` | purge Redis keys \> 12 h | Redis |
| `purge_old_partitions` | `0 4 * * 0` | drop partitions past retention | Analytics PG |

Airflow connections (`pg_analytics`, `redis_reports`) are injected via Vault secrets backend.

---

#### **4 . Environment variables & secrets**

| Variable | Source | Notes |
| ----- | ----- | ----- |
| `REPORTS_DB_URL` | Vault `secret/analytics/pg/url` | read‑only user |
| `REDIS_URL` | Vault `secret/common/redis/url` | TTL cache |
| `AIRFLOW__CORE__FERNET_KEY` | Vault `secret/analytics/airflow/fernet` |  |
| `PROMETHEUS_BASE_URL` | ConfigMap `analytics-settings` | for `etl_perf` |
| `EXPORT_MAX_ROWS` | ConfigMap `analytics-settings` | `100000` |

Secrets injected by CSI Vault; ConfigMap mounted read‑only.

---

#### **5 . CI/CD extensions**

| Job | Purpose |
| ----- | ----- |
| **schema‑diff** | verifies migrations match star‑schema (deny drift) |
| **dag‑lint** | `pylint` \+ `airflow dags list --safe-mode` |
| **perf‑budget** | fails build if k6 latency \> 350 ms @ 200 RPS |
| **export‑guard** | ensures CSV export ≤ EXPORT\_MAX\_ROWS |

Build push tags images `reports-api` and `reports-etl`; Argo CD auto‑sync to `staging`, then manual promote `prod`.

---

#### **6 . Prometheus metrics & alerts**

| Alert name | Expression | Severity |
| ----- | ----- | ----- |
| **`reports_latency_p95`** | `histogram_quantile(0.95, rate(reports_request_seconds_bucket[5m])) > 0.4` | critical |
| **`reports_error_rate`** | `sum(rate(reports_requests_total{status=~"5.."}[5m])) / sum(rate(reports_requests_total[5m])) > 0.02` | warning |
| **`etl_task_fail`** | `airflow_dag_run_failed_total{dag_id=~"etl_.*"} > 0` | critical |
| **`mat_view_refresh_duration`** | `reports_matview_refresh_seconds > 60` | warning |
| **`redis_cache_hit_ratio_low`** | `rate(reports_cache_hit_total[5m]) / rate(reports_cache_req_total[5m]) < 0.5` | info |

Dashboards `reports-api.json` and `report-etl.json` show throughput, cache hit rate, ETL runtime.

---

#### **7 . Runbooks**

* **High API latency** → scale `reports-api` (check HPA), inspect slow query log on analytics PG.

* **ETL failure** → Airflow UI → retry task; if database lock, run `SELECT * FROM pg_locks` and kill blocking PID.

* **Mat view refresh over 60 s** → vacuum partition, review index bloat.

* **Redis miss flood** → increase `maxmemory`, verify cache key churn.

---

#### **8 . Backup & disaster recovery**

| Asset | Strategy |
| ----- | ----- |
| Analytics PG | pgBackRest full nightly, incremental 30 min, retain 14 days |
| Airflow metadata DB | included in pgBackRest |
| DAG code | in Git; Argo CD redeploy |
| Redis cache | no backup (ephemeral) |

Quarterly restore‑drill: restore analytics snapshot to staging and run sample `/reports` queries.

---

#### **9 . Security & compliance**

* All facts store **hashed user IDs** (see 5.3).

* Role `reports_reader` is enforced via Postgres `search_path` and RLS OFF.

* API export limited to 100 k rows and only for `ADMIN` role.

* Audit log (`audit_request_log`) shipped via Fluent Bit to OpenSearch; retention 6 months.

---

#### **10 . SLO mapping**

| KPI | Objective | Alert |
| ----- | ----- | ----- |
| `GET /reports/*` P95 | ≤ 400 ms | `reports_latency_p95` |
| Error rate | ≤ 2 % 5 min | `reports_error_rate` |
| ETL task success | 100 % daily | `etl_task_fail` |
| Mat view refresh | \< 60 s | `mat_view_refresh_duration` |

---

All Reporting & Analytics infrastructure elements are now fully specified: deployments, Airflow DAGs, variables, monitoring and recovery procedures, completing the layer 5 documentation set.


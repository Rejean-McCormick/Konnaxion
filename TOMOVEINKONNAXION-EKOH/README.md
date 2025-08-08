### **23 / 24 `README.md` (module-level quick-start)**


# EkoH + Smart Vote — Developer Quick-Start

Welcome!  This repo now contains the **EkoH expertise engine** and the
**Smart-Vote weighted ballot system** as a self-contained module under
`modules/ekoh-smartvote/`.  Follow the steps below and you’ll have the full
stack (Postgres 15 + Redis 7 + Kafka/Redpanda + Django 4.2 + Celery 5.3) running
locally in minutes.

---

## 1 Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **Docker** | 24 + | Containers for DB / Redis / Kafka |
| **Docker Compose** | v2 plugin | orchestrates the dev stack |
| **Poetry** | 1.8 + | Python dependency management |
| **pre-commit** | 3.6 + | local lint hooks (optional) |

---

## 2 Getting the code

```bash
git clone https://github.com/Rejean-McCormick/Konnaxion.git
cd Konnaxion
````

---

## 3 Spin up the dev stack

```bash
make dev-up          # build images & start db/redis/kafka/django
make migrate         # apply Ekoh & Smart-Vote migrations
make load-fixtures   # load UNESCO ISCED-F taxonomy (≈ 2 s)
```

Visit [http://localhost:8000/](http://localhost:8000/) — the Django server is live.

* API docs: [http://localhost:8000/api/schema/swagger/](http://localhost:8000/api/schema/swagger/)
* Health check: [http://localhost:8000/healthz](http://localhost:8000/healthz)

---

## 4 Common tasks

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `make lint`     | Ruff + Black in check-only mode      |
| `make fmt`      | Auto-formats with Ruff-fix & Black   |
| `make test`     | Runs pytest in the **app** container |
| `make dev-down` | Stops the whole Compose stack        |

---

## 5 Celery workers

Dev stack launches two extra containers:

* **worker** — executes tasks `ekoh_score_recalc`, `vote_aggregate`, etc.
* **beat**   — schedules periodic jobs (nightly score rebuild, minutely aggregator).

Logs:

```bash
docker compose logs -f worker
docker compose logs -f beat
```

---

## 6 Environment variables (excerpt)

| Name                   | Default                  | Doc                                       |
| ---------------------- | ------------------------ | ----------------------------------------- |
| `EKOH_MULTIPLIER_CAP`  | `1.50`                   | caps dot-product before ethics multiplier |
| `RAW_WEIGHT_QUALITY`   | `1.000`                  | axis coefficient                          |
| `RAW_WEIGHT_EXPERTISE` | `1.500`                  | axis coefficient                          |
| `RAW_WEIGHT_FREQUENCY` | `0.750`                  | axis coefficient                          |
| `PROMETHEUS_BASE_URL`  | `http://prometheus:9090` | metrics                                   |
| `EXPORT_MAX_ROWS`      | `100000`                 | CSV guardrail                             |

All env vars live in **`charts/ekoh-smartvote/values.yaml`** for staging/prod.

---

## 7 Database schema

Schema objects are documented in **`docs/01-db_schema.md`** and created by
migrations under:

```
modules/ekoh-smartvote/
    ekoh/migrations/
    smart_vote/migrations/
```

Partition helper SQL (`infra/db/partition_helper.sql`) runs nightly to keep
`vote`, `vote_ledger`, and `score_history` rotated monthly.

---

## 8 Testing end-to-end

```bash
# cast a ballot
http POST :8000/api/v1/smart-vote/cast \
  consultation=7077e77f-... \
  target_id=7077e77f-... \
  modality=approval \
  raw_value:=1  \
  "Authorization: Bearer <token>"

# aggregate votes immediately
docker compose exec app poetry run \
  python - <<'PY'
from konnaxion.smart_vote.tasks.aggregator import aggregate_votes
aggregate_votes()
PY
```

---

## 9 Deploy to Kubernetes (staging)

```bash
helm repo add konnaxion https://charts.konnaxion.org
helm upgrade --install ekoh-smartvote \
  ./modules/ekoh-smartvote/charts/ekoh-smartvote \
  --values ./modules/ekoh-smartvote/charts/ekoh-smartvote/values.yaml \
  --namespace konnaxion-intel
```

---

# Konnaxion Deployment Guide — Namecheap VPS

## Current VPS layout

```text
/home/deploy/apps/Konnaxion/
├── backend/
└── frontend/
````

Backend runs with Docker Compose.
Frontend runs separately with Node.js / pnpm.

---

## 1. Backend deployment

### Required files

```text
backend/docker-compose.production.yml
backend/.envs/.production/.django
backend/.envs/.production/.postgres
```

### `.django`

```env
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=CHANGE_ME
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=159.198.41.96,localhost,127.0.0.1,konnaxion.local,www.konnaxion.local

USE_DOCKER=yes

DATABASE_URL=postgres://konnaxion:CHANGE_ME_POSTGRES_PASSWORD@postgres:5432/konnaxion

REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0

DJANGO_ADMIN_URL=admin/
SENTRY_DSN=
```

### `.postgres`

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=konnaxion
POSTGRES_USER=konnaxion
POSTGRES_PASSWORD=CHANGE_ME_POSTGRES_PASSWORD
```

### Start backend

```bash
cd ~/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d --build
```

### Run migrations

```bash
docker compose -f docker-compose.production.yml run --rm django python manage.py migrate
```

### Create Django admin

```bash
docker compose -f docker-compose.production.yml run --rm django python manage.py createsuperuser
```

### Check status

```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=100 django
```

---

## 2. Backend fixes required

`backend/requirements/production.txt` must include:

```txt
psycopg[binary]==3.2.12
```

Without this, Django fails with:

```text
Error loading psycopg2 or psycopg module
```

`SENTRY_DSN=` must exist in `.django`, even if empty, because production settings require it.

---

## 3. Port 80 conflict

If Traefik fails with:

```text
failed to bind host port 0.0.0.0:80/tcp: address already in use
```

Check:

```bash
sudo ss -tulnp | grep ':80'
```

If host nginx is using port 80:

```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```

Then restart:

```bash
cd ~/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d
```

---

## 4. Local test domain

For local browser testing, add this to Windows hosts:

```text
159.198.41.96 konnaxion.local
```

File:

```text
C:\Windows\System32\drivers\etc\hosts
```

Then use:

```text
http://konnaxion.local
http://konnaxion.local/admin/
```

---

## 5. Frontend environment

Frontend env file:

```text
frontend/.env.production
```

Recommended current values:

```env
NEXT_PUBLIC_API_BASE=http://konnaxion.local/api
NEXT_PUBLIC_BACKEND_BASE=http://konnaxion.local
```

---

## 6. Frontend build

```bash
cd ~/apps/Konnaxion/frontend
pnpm install --frozen-lockfile
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

If build succeeds:

```bash
pnpm start --hostname 0.0.0.0 --port 3000
```

Open:

```text
http://konnaxion.local:3000
```

---

## 7. Important frontend gotchas

Do not ignore:

```text
frontend/app/reports/
```

This folder contains real Next.js routes.

The following file must be tracked:

```text
frontend/app/reports/ReportsPageShell.tsx
```

If missing, build fails with:

```text
Module not found: Can't resolve '../ReportsPageShell'
```

The frontend `.gitignore` must not contain:

```gitignore
reports/
```

Use this instead:

```gitignore
playwright-report/
test-results/
artifacts/
```

---

## 8. Production build validation

Before pushing or uploading frontend changes, test locally:

```powershell
cd C:\mycode\Konnaxion\Konnaxion\frontend
pnpm install --frozen-lockfile
$env:NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

Only deploy if local build succeeds.

---

## 9. Uploading files to VPS

This VPS directory is not guaranteed to be a Git repository. If `git pull` fails with:

```text
fatal: not a git repository
```

use `scp` or upload a clean archive.

Example single-file upload:

```powershell
scp "C:\mycode\Konnaxion\Konnaxion\frontend\app\reports\ReportsPageShell.tsx" deploy@159.198.41.96:/home/deploy/apps/Konnaxion/frontend/app/reports/ReportsPageShell.tsx
```

Example env upload:

```powershell
scp "C:\mycode\Konnaxion\Konnaxion\backend\.envs\.production\.django" deploy@159.198.41.96:/home/deploy/apps/Konnaxion/backend/.envs/.production/.django
scp "C:\mycode\Konnaxion\Konnaxion\backend\.envs\.production\.postgres" deploy@159.198.41.96:/home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres
```

---

## 10. Archive deployment

Create a clean archive from Git:

```powershell
cd C:\mycode\Konnaxion\Konnaxion
git archive --format=tar.gz -o konnaxion-deploy.tar.gz HEAD
```

Upload:

```powershell
scp .\konnaxion-deploy.tar.gz deploy@159.198.41.96:/home/deploy/apps/
```

Extract on VPS:

```bash
cd ~/apps
rm -rf Konnaxion
mkdir Konnaxion
tar -xzf konnaxion-deploy.tar.gz -C Konnaxion
```

Do not commit deployment archives to Git.

Add to root `.gitignore`:

```gitignore
*.tar.gz
*.zip
```

If already committed:

```bash
git rm --cached konnaxion-deploy.tar.gz
git commit -m "Remove deployment archive from repo"
git push
```

---

## 11. Useful commands

### Backend

```bash
cd ~/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=100 django
docker compose -f docker-compose.production.yml logs --tail=100 traefik
```

### Frontend

```bash
cd ~/apps/Konnaxion/frontend
pnpm build
pnpm start --hostname 0.0.0.0 --port 3000
```

### Ports

```bash
sudo ss -tulnp | grep -E ':80|:443|:3000|:5555'
```

---

## 12. Current architecture note

Current working deployment is hybrid:

```text
Backend: Docker Compose
Frontend: Node.js / pnpm
Database: Docker Postgres
Redis: Docker Redis
Proxy: Docker Traefik
```

This is not the same as the previous pure systemd setup.



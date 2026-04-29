# Konnaxion Deployment Guide — Namecheap VPS

## Current VPS layout

```text
/home/deploy/apps/Konnaxion/
├── backend/
└── frontend/
````

Current working deployment is hybrid:

```text
Backend: Docker Compose
Frontend: Node.js / pnpm
Database: Docker Postgres
Redis: Docker Redis
Proxy: Docker Traefik
```

This is not the same as the previous pure systemd setup.

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

ETHIKOS_DEMO_IMPORTER_ENABLED=true
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
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d --build
```

### Run migrations

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml run --rm django python manage.py migrate
```

### Create Django admin

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml run --rm django python manage.py createsuperuser
```

### Check status

```bash
cd /home/deploy/apps/Konnaxion/backend
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

`ETHIKOS_DEMO_IMPORTER_ENABLED=true` must exist in `.django` if the ethiKos demo importer should work in production.

---

## 3. Recover production env files if missing

Sometimes `/home/deploy/apps/Konnaxion` is recreated from a clean Git archive and the production env files are missing.

Check:

```bash
find /home/deploy/apps -type f \( \
  -path "*/backend/.envs/.production/.django" -o \
  -path "*/backend/.envs/.production/.postgres" -o \
  -path "*/frontend/.env.production" \
\) -print
```

If no env files are found, recover from running Docker containers.

### Find running containers

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

Auto-detect Django and Postgres containers:

```bash
DJANGO_CONTAINER=$(docker ps --format '{{.Names}}' | grep -Ei 'django|backend|konnaxion' | grep -Evi 'postgres|redis|traefik|celery|flower|nginx' | head -1)
POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep -Ei 'postgres|db' | head -1)

echo "Django container: $DJANGO_CONTAINER"
echo "Postgres container: $POSTGRES_CONTAINER"
```

### Recover `.django`

```bash
mkdir -p /home/deploy/apps/Konnaxion/backend/.envs/.production

docker inspect "$DJANGO_CONTAINER" \
  --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | grep -E '^(DJANGO_|DATABASE_URL|REDIS_URL|CELERY_|SENTRY_DSN|USE_DOCKER|ETHIKOS_)' \
  > /home/deploy/apps/Konnaxion/backend/.envs/.production/.django

grep -q '^SENTRY_DSN=' /home/deploy/apps/Konnaxion/backend/.envs/.production/.django \
  || echo 'SENTRY_DSN=' >> /home/deploy/apps/Konnaxion/backend/.envs/.production/.django

grep -q '^ETHIKOS_DEMO_IMPORTER_ENABLED=' /home/deploy/apps/Konnaxion/backend/.envs/.production/.django \
  || echo 'ETHIKOS_DEMO_IMPORTER_ENABLED=true' >> /home/deploy/apps/Konnaxion/backend/.envs/.production/.django
```

### Recover `.postgres`

```bash
docker inspect "$POSTGRES_CONTAINER" \
  --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | grep -E '^(POSTGRES_DB|POSTGRES_USER|POSTGRES_PASSWORD)=' \
  > /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres

grep -q '^POSTGRES_HOST=' /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres \
  || echo 'POSTGRES_HOST=postgres' >> /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres

grep -q '^POSTGRES_PORT=' /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres \
  || echo 'POSTGRES_PORT=5432' >> /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres
```

### Recreate frontend env

```bash
cat > /home/deploy/apps/Konnaxion/frontend/.env.production <<'EOF'
NEXT_PUBLIC_API_BASE=http://konnaxion.local/api
NEXT_PUBLIC_BACKEND_BASE=http://konnaxion.local
EOF
```

### Validate keys only

Do not print full secrets. Validate keys only:

```bash
echo "---- Django env keys ----"
cut -d= -f1 /home/deploy/apps/Konnaxion/backend/.envs/.production/.django

echo "---- Postgres env keys ----"
cut -d= -f1 /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres

echo "---- Frontend env ----"
cat /home/deploy/apps/Konnaxion/frontend/.env.production
```

Expected Django keys include:

```text
USE_DOCKER
DJANGO_ADMIN_URL
CELERY_BROKER_URL
DATABASE_URL
DJANGO_SETTINGS_MODULE
DJANGO_SECRET_KEY
DJANGO_ALLOWED_HOSTS
REDIS_URL
DJANGO_DEBUG
SENTRY_DSN
ETHIKOS_DEMO_IMPORTER_ENABLED
```

Expected Postgres keys include:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_PORT
```

---

## 4. Port 80 conflict

If Traefik fails with:

```text
failed to bind host port 0.0.0.0:80/tcp: address already in use
```

Check:

```bash
sudo ss -tulnp | grep ':80'
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -E '0.0.0.0:80|:::80|:80->'
```

If host nginx is using port 80:

```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```

Confirm port 80 is free:

```bash
sudo ss -tulnp | grep ':80'
```

Expected: no output.

Then restart backend:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d
docker compose -f docker-compose.production.yml ps
```

You want to see:

```text
backend-traefik-1    Up
```

---

## 5. Local test domain

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
http://konnaxion.local:3000
```

---

## 6. Frontend environment

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

## 7. Frontend build on VPS

The frontend runs separately with Node.js / pnpm.

```bash
cd /home/deploy/apps/Konnaxion/frontend
pnpm install --frozen-lockfile
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
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

## 8. Frontend build memory issues

The Namecheap VPS may have only about 2 GB RAM. Next.js production builds can fail with either:

```text
Next.js build worker exited with signal: SIGKILL
```

or:

```text
FATAL ERROR: JavaScript heap out of memory
```

### Check memory

```bash
free -h
df -h
```

### Add extra swap

If there is already an active `/swapfile`, do not overwrite it. Add a second swap file:

```bash
sudo fallocate -l 6G /swapfile-nextbuild
sudo chmod 600 /swapfile-nextbuild
sudo mkswap /swapfile-nextbuild
sudo swapon /swapfile-nextbuild
free -h
```

Make it persistent:

```bash
echo '/swapfile-nextbuild none swap sw 0 0' | sudo tee -a /etc/fstab
```

Expected swap after this may be around:

```text
Swap: 8.0Gi
```

### Stop non-essential workers before frontend build

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml stop celeryworker celerybeat flower
free -h
```

### Retry frontend build with the documented heap size

```bash
cd /home/deploy/apps/Konnaxion/frontend
rm -rf .next
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
pnpm build
```

Do not lower the heap to `1024` for this project; it can produce JavaScript heap errors.

### Restart workers after frontend is running

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d celeryworker celerybeat flower
docker compose -f docker-compose.production.yml ps
```

---

## 9. Important frontend gotchas

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

## 10. Production build validation before deployment

Before uploading frontend changes, test locally:

```powershell
cd C:\mycode\Konnaxion\Konnaxion\frontend
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --pretty false
$env:NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

Only deploy if local typecheck and local production build succeed.

---

## 11. Uploading files to VPS

The VPS directory is not guaranteed to be a Git repository. If `git pull` fails with:

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

## 12. Safe archive deployment

Create a clean archive from Git:

```powershell
cd C:\mycode\Konnaxion\Konnaxion
git status
git archive --format=tar.gz -o konnaxion-deploy.tar.gz HEAD
```

Upload:

```powershell
scp .\konnaxion-deploy.tar.gz deploy@159.198.41.96:/home/deploy/apps/
```

On the VPS, back up the current app before extracting. Do not use `rm -rf Konnaxion` unless you already saved env files.

```bash
cd /home/deploy/apps

mv Konnaxion Konnaxion_backup_$(date +%Y%m%d_%H%M%S)
mkdir Konnaxion
tar -xzf konnaxion-deploy.tar.gz -C Konnaxion
```

Restore env files from the newest backup if they exist:

```bash
BACKUP=$(ls -dt /home/deploy/apps/Konnaxion_backup_* | head -1)

mkdir -p /home/deploy/apps/Konnaxion/backend/.envs/.production

if [ -f "$BACKUP/backend/.envs/.production/.django" ]; then
  cp "$BACKUP/backend/.envs/.production/.django" \
    /home/deploy/apps/Konnaxion/backend/.envs/.production/.django
fi

if [ -f "$BACKUP/backend/.envs/.production/.postgres" ]; then
  cp "$BACKUP/backend/.envs/.production/.postgres" \
    /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres
fi

if [ -f "$BACKUP/frontend/.env.production" ]; then
  cp "$BACKUP/frontend/.env.production" \
    /home/deploy/apps/Konnaxion/frontend/.env.production
fi
```

If backup env files are missing, use the recovery section above.

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

## 13. Full manual deployment sequence

### Local machine

```powershell
cd C:\mycode\Konnaxion\Konnaxion
git status

cd frontend
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --pretty false
$env:NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

cd ..
git archive --format=tar.gz -o konnaxion-deploy.tar.gz HEAD
scp .\konnaxion-deploy.tar.gz deploy@159.198.41.96:/home/deploy/apps/
```

### VPS

```bash
cd /home/deploy/apps

mv Konnaxion Konnaxion_backup_$(date +%Y%m%d_%H%M%S)
mkdir Konnaxion
tar -xzf konnaxion-deploy.tar.gz -C Konnaxion
```

Recover or restore env files.

Then:

```bash
sudo systemctl stop nginx || true
sudo systemctl disable nginx || true

cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml run --rm django python manage.py migrate
docker compose -f docker-compose.production.yml ps
```

Prepare frontend build:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml stop celeryworker celerybeat flower || true

cd /home/deploy/apps/Konnaxion/frontend
pnpm install --frozen-lockfile
rm -rf .next
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
pnpm build
```

Start frontend:

```bash
cd /home/deploy/apps/Konnaxion/frontend
pkill -f "next start" || true
pkill -f "pnpm start" || true

nohup pnpm start --hostname 0.0.0.0 --port 3000 > frontend.log 2>&1 &
sleep 4
tail -n 60 frontend.log
```

Restart workers:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d celeryworker celerybeat flower
docker compose -f docker-compose.production.yml ps
```

Validate:

```bash
curl -I http://127.0.0.1
curl -I http://127.0.0.1:3000
```

---

## 14. Useful commands

### Backend

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs --tail=100 django
docker compose -f docker-compose.production.yml logs --tail=100 traefik
```

### Frontend

```bash
cd /home/deploy/apps/Konnaxion/frontend
pnpm build
pnpm start --hostname 0.0.0.0 --port 3000
tail -f frontend.log
```

### Ports

```bash
sudo ss -tulnp | grep -E ':80|:443|:3000|:5555'
```

### Memory

```bash
free -h
df -h
```

### Docker containers

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

---

## 15. Security notes

Do not paste full `.env` files or terminal logs containing any of these values into chat/tools:

```text
DATABASE_URL
POSTGRES_PASSWORD
DJANGO_SECRET_KEY
API keys
tokens
private keys
```

If a secret appears in copied logs, rotate it after deployment is stable.

Recommended later cleanup:

```text
1. Rotate Postgres password.
2. Update backend/.envs/.production/.django DATABASE_URL.
3. Update backend/.envs/.production/.postgres POSTGRES_PASSWORD.
4. Restart backend containers.
```


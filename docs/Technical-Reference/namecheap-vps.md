Replace the guide with this version. I folded in the issues from the actual deployment: non-Git VPS folder, missing env files, port 80 conflict, frontend memory/swap, Traefik routing root to Next instead of Django, Let’s Encrypt failing because `.local` was included, the `$` in `DJANGO_SECRET_KEY`, `curl` being killed by the miner, and the `amco`/`pakchoi`/`/tmp/sshd` compromise. Base draft referenced: 

# Konnaxion Deployment Guide — Namecheap VPS

## Current VPS layout

```text
/home/deploy/apps/Konnaxion/
├── backend/
└── frontend/
```

Current working deployment is hybrid:

```text
Backend: Docker Compose
Frontend: Node.js / pnpm
Database: Docker Postgres
Redis: Docker Redis
Proxy: Docker Traefik
```

This is not the same as the previous pure systemd setup.

Important current routing:

```text
https://konnaxion.com/          -> Next.js frontend on port 3000
https://konnaxion.com/api/      -> Django
https://konnaxion.com/admin/    -> Django admin
https://konnaxion.com/media/    -> Docker nginx media service
https://konnaxion.com:5555/     -> Flower, if enabled
```

---

## 0. Security warning from the 2026-04 deployment

The Namecheap VPS was compromised during deployment.

Observed compromise indicators:

```text
Docker image:
negoroo/amco:123

Containers:
amco_ffb3b52f
amco_d33f09cb

Miner process:
./https -a rx/0 -o pool.supportxmr.com:3333 ...

Backdoor/persistence:
/tmp/sshd
/dev/shm/*
deploy user crontab
pakchoi user creation attempt
/etc/sudoers.d/99-pakchoi
```

This means the VPS must not be treated as trusted long-term.

Short-term cleanup can keep the app online, but the correct long-term fix is:

```text
1. Rebuild on a clean VPS.
2. Do not clone the compromised disk.
3. Restore only clean source code, a verified DB dump, and necessary media files.
4. Rotate all secrets.
5. Use SSH keys only.
6. Disable password login.
7. Use cloud firewall + UFW.
8. Keep only ports 22, 80, and 443 public.
```

Secrets to rotate:

```text
SSH keys
deploy user password, if any
DJANGO_SECRET_KEY
POSTGRES_PASSWORD
DATABASE_URL
Neon/database credentials from old systemd unit
Django admin passwords
API keys
tokens
private keys
```

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
DJANGO_SECRET_KEY='CHANGE_ME'
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=159.198.41.96,localhost,127.0.0.1,konnaxion.com,www.konnaxion.com

USE_DOCKER=yes

DATABASE_URL=postgres://konnaxion:CHANGE_ME_POSTGRES_PASSWORD@postgres:5432/konnaxion

REDIS_URL=redis://redis:6379/0
CELERY_BROKER_URL=redis://redis:6379/0

DJANGO_ADMIN_URL=admin/
SENTRY_DSN=

ETHIKOS_DEMO_IMPORTER_ENABLED=true
```

Important: if `DJANGO_SECRET_KEY` contains `$`, quote it:

```env
DJANGO_SECRET_KEY='value_with_$inside'
```

or escape `$` as `$$`.

If not fixed, Docker Compose may show warnings like:

```text
The "t7dh" variable is not set. Defaulting to a blank string.
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

Without this, Django can fail with:

```text
Error loading psycopg2 or psycopg module
```

`SENTRY_DSN=` must exist in `.django`, even if empty, because production settings require it.

`ETHIKOS_DEMO_IMPORTER_ENABLED=true` must exist in `.django` if the ethiKos demo importer should work in production.

---

## 3. Frontend production environment

Frontend env file:

```text
frontend/.env.production
```

For public production domain:

```env
NEXT_PUBLIC_API_BASE=https://konnaxion.com/api
NEXT_PUBLIC_BACKEND_BASE=https://konnaxion.com
```

Do not leave production frontend env pointing to `konnaxion.local`.

Next.js bakes these values at build time, so after changing `frontend/.env.production`, rebuild the frontend:

```bash
cd /home/deploy/apps/Konnaxion/frontend
rm -rf .next
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1
pnpm build
```

---

## 4. Traefik production routing

Final production Traefik config should route:

```text
/          -> frontend on host port 3000
/api/      -> Django
/admin/    -> Django
/media/    -> media nginx
```

### `docker-compose.production.yml` requirement

The `traefik` service must include `extra_hosts` so the Traefik container can reach the host Next.js server on port `3000`.

```yaml
  traefik:
    build:
      context: .
      dockerfile: ./compose/production/traefik/Dockerfile
    image: konnaxion_production_traefik
    depends_on:
      - django
    volumes:
      - production_traefik:/etc/traefik/acme
    extra_hosts:
      - "host.docker.internal:host-gateway"
    ports:
      - "0.0.0.0:80:80"
      - "0.0.0.0:443:443"
      - "0.0.0.0:5555:5555"
```

### Final `backend/compose/production/traefik/traefik.yml`

Important: do **not** include `konnaxion.local` in HTTPS routers that use Let’s Encrypt. Let’s Encrypt cannot issue certificates for `.local`.

```yaml
log:
  level: INFO

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: web-secure
          scheme: https

  web-secure:
    address: ":443"

  flower:
    address: ":5555"

certificatesResolvers:
  letsencrypt:
    acme:
      email: "boatbuilder610@gmail.com"
      storage: /etc/traefik/acme/acme.json
      httpChallenge:
        entryPoint: web

http:
  routers:
    frontend-secure-router:
      rule: "Host(`konnaxion.com`) || Host(`www.konnaxion.com`)"
      entryPoints:
        - web-secure
      service: frontend
      tls:
        certResolver: letsencrypt

    api-secure-router:
      rule: "(Host(`konnaxion.com`) || Host(`www.konnaxion.com`)) && (PathPrefix(`/api/`) || PathPrefix(`/admin/`))"
      entryPoints:
        - web-secure
      middlewares:
        - csrf
      service: django
      priority: 100
      tls:
        certResolver: letsencrypt

    web-media-router:
      rule: "(Host(`konnaxion.com`) || Host(`www.konnaxion.com`)) && PathPrefix(`/media/`)"
      entryPoints:
        - web-secure
      middlewares:
        - csrf
      service: django-media
      priority: 100
      tls:
        certResolver: letsencrypt

    flower-secure-router:
      rule: "Host(`konnaxion.com`) || Host(`www.konnaxion.com`)"
      entryPoints:
        - flower
      service: flower
      tls:
        certResolver: letsencrypt

  middlewares:
    csrf:
      headers:
        hostsProxyHeaders:
          - X-CSRFToken

  services:
    frontend:
      loadBalancer:
        servers:
          - url: http://host.docker.internal:3000

    django:
      loadBalancer:
        servers:
          - url: http://django:5000

    flower:
      loadBalancer:
        servers:
          - url: http://flower:5555

    django-media:
      loadBalancer:
        servers:
          - url: http://nginx:80

providers:
  file:
    filename: /etc/traefik/traefik.yml
    watch: true
```

### Rebuild Traefik after config changes

```bash
cd /home/deploy/apps/Konnaxion/backend

docker compose -f docker-compose.production.yml build --no-cache traefik
docker compose -f docker-compose.production.yml up -d --force-recreate traefik
```

Verify the running container has the right config:

```bash
docker exec backend-traefik-1 cat /etc/traefik/traefik.yml | grep -n "konnaxion\|Host"
docker port backend-traefik-1
```

Expected:

```text
Only konnaxion.com and www.konnaxion.com appear.
80/tcp -> 0.0.0.0:80
443/tcp -> 0.0.0.0:443
5555/tcp -> 0.0.0.0:5555
```

---

## 5. Let’s Encrypt / HTTPS

### DNS must point to VPS

From local PowerShell:

```powershell
nslookup konnaxion.com
nslookup www.konnaxion.com
```

Expected:

```text
159.198.41.96
```

Namecheap DNS records:

```text
A Record
Host: @
Value: 159.198.41.96

A Record
Host: www
Value: 159.198.41.96
```

### Test DNS from Docker

```bash
docker run --rm busybox nslookup acme-v02.api.letsencrypt.org
```

This must work.

### Common ACME failure

Bad:

```text
Cannot issue for "konnaxion.local": Domain name does not end with a valid public suffix
```

Fix: remove `konnaxion.local` and `www.konnaxion.local` from all HTTPS routers using `certResolver`.

### Reset ACME if needed

Stop Traefik:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml stop traefik
```

Find volume:

```bash
docker volume ls | grep traefik
```

Usually:

```text
backend_production_traefik
```

Remove it only after Traefik is stopped:

```bash
docker volume rm backend_production_traefik
```

Then recreate Traefik:

```bash
docker compose -f docker-compose.production.yml build --no-cache traefik
docker compose -f docker-compose.production.yml up -d --force-recreate traefik
docker compose -f docker-compose.production.yml logs -f traefik
```

Verify from local PowerShell:

```powershell
curl.exe -I https://konnaxion.com
curl.exe -I https://www.konnaxion.com
```

Expected:

```text
HTTP/1.1 200 OK
X-Powered-By: Next.js
```

---

## 6. Recover production env files if missing

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

### Validate keys only

Do not print full secrets:

```bash
echo "---- Django env keys ----"
cut -d= -f1 /home/deploy/apps/Konnaxion/backend/.envs/.production/.django

echo "---- Postgres env keys ----"
cut -d= -f1 /home/deploy/apps/Konnaxion/backend/.envs/.production/.postgres

echo "---- Frontend env ----"
cat /home/deploy/apps/Konnaxion/frontend/.env.production
```

---

## 7. Port 80 conflict

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

You want Traefik to publish ports:

```text
backend-traefik-1   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

If `docker port backend-traefik-1` returns `{}` or nothing, recreate Traefik:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml stop traefik
docker compose -f docker-compose.production.yml rm -f traefik
docker compose -f docker-compose.production.yml up -d traefik
docker port backend-traefik-1
```

---

## 8. Frontend build on VPS

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
cd /home/deploy/apps/Konnaxion/frontend

pkill -f "next start" || true
pkill -f "pnpm start" || true

nohup pnpm start --hostname 0.0.0.0 --port 3000 > frontend.log 2>&1 &
sleep 4
tail -n 60 frontend.log
```

Expected:

```text
Next.js ready on http://0.0.0.0:3000
```

---

## 9. Frontend build memory issues

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

## 10. Compromise detection and cleanup

Use this before and after deployment on the current Namecheap VPS.

### Check suspicious Docker containers

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Command}}"
```

Suspicious indicators previously seen:

```text
amco_ffb3b52f
amco_d33f09cb
negoroo/amco:123
```

Remove if present:

```bash
docker stop amco_ffb3b52f amco_d33f09cb 2>/dev/null || true
docker rm amco_ffb3b52f amco_d33f09cb 2>/dev/null || true
docker ps -a --filter ancestor=negoroo/amco:123 -q | xargs -r docker rm -f
docker rmi -f negoroo/amco:123 2>/dev/null || true
```

### Check suspicious processes

```bash
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head -25
pgrep -af 'supportxmr|rx/0|amco|run.sh|/tmp/sshd|/dev/shm/|./https' || echo "no known malware process found"
```

Suspicious indicators previously seen:

```text
./https -a rx/0 -o pool.supportxmr.com:3333
/dev/shm/qLNOmpq
/dev/shm/UrP2tchg
/dev/shm/LQRJBUmva
/dev/shm/nyVO0
/dev/shm/uIX9F6
/dev/shm/let
/dev/shm/install.sh
/tmp/sshd
run.sh
```

Kill and remove:

```bash
sudo pkill -9 -f 'supportxmr' || true
sudo pkill -9 -f 'pool.sup' || true
sudo pkill -9 -f 'rx/0' || true
sudo pkill -9 -f './https' || true
sudo pkill -9 -f 'run.sh' || true
sudo pkill -9 -f '/tmp/sshd' || true
sudo pkill -9 -f '/dev/shm' || true

sudo rm -f /tmp/sshd
sudo rm -f /dev/shm/qLNOmpq /dev/shm/UrP2tchg /dev/shm/LQRJBUmva /dev/shm/nyVO0 /dev/shm/uIX9F6 /dev/shm/let /dev/shm/install.sh
```

### Check malicious crontab

```bash
echo "== deploy cron =="
crontab -l 2>/dev/null || true

echo "== root cron =="
sudo crontab -l 2>/dev/null || true

echo "== cron/systemd persistence =="
sudo grep -RsnE 'supportxmr|pool|rx/0|xmrig|amco|run.sh|/dev/shm|/tmp/sshd|https|pakchoi' \
  /etc/cron* /var/spool/cron /var/spool/cron/crontabs /etc/systemd/system /lib/systemd/system \
  2>/dev/null || true
```

Malicious crontab previously seen:

```cron
*/30 * * * * (docker start amco_d33f09cb 2>/dev/null || true) >/dev/null 2>&1
*/30 * * * * (docker start amco_ffb3b52f 2>/dev/null || true) >/dev/null 2>&1
*/30 * * * * (id pakchoi >/dev/null 2>&1 || (useradd -m -s /bin/bash pakchoi ...))
@reboot /tmp/sshd
*/5 * * * * pgrep -f /tmp/sshd >/dev/null 2>&1||/tmp/sshd &
```

If the deploy user crontab is malicious, clear it:

```bash
crontab -r
crontab -l 2>/dev/null || echo "deploy crontab cleared"
```

### Remove backdoor user

```bash
getent passwd pakchoi || echo "pakchoi user absent"
sudo rm -f /etc/sudoers.d/99-pakchoi
sudo userdel -r pakchoi 2>/dev/null || true
```

### Disable old systemd backend

Current architecture is Docker backend + pnpm frontend. The old `konnaxion-gunicorn.service` should not be active.

```bash
sudo systemctl disable --now konnaxion-gunicorn.service 2>/dev/null || true
sudo systemctl status konnaxion-gunicorn.service --no-pager 2>/dev/null || true
```

Do not paste the old unit file content. It may contain secrets.

### Verify no respawn

```bash
sleep 30
pgrep -af 'supportxmr|rx/0|amco|run.sh|/tmp/sshd|/dev/shm/|./https' || echo "no known malware process found"
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head -25
```

Note: `pool_workqueue_` is a normal Linux kernel thread and is not the miner.

---

## 11. Validate without curl if curl is killed

During the compromise, `curl` was repeatedly killed. If that happens, use Python:

```bash
python3 - <<'PY'
import http.client

tests = [
    ("Traefik HTTP konnaxion.com", "127.0.0.1", 80, "/", {"Host": "konnaxion.com"}),
    ("Frontend direct", "127.0.0.1", 3000, "/", {}),
]

for label, host, port, path, headers in tests:
    try:
        conn = http.client.HTTPConnection(host, port, timeout=10)
        conn.request("HEAD", path, headers=headers)
        res = conn.getresponse()
        print(label, "=>", res.status, res.reason, dict(res.getheaders()).get("Location"))
        conn.close()
    except Exception as exc:
        print(label, "=> ERROR:", repr(exc))
PY
```

Expected:

```text
Traefik HTTP konnaxion.com => 308 Permanent Redirect https://konnaxion.com/
Frontend direct => 200 OK None
```

---

## 12. Important frontend gotchas

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
*.tar.gz
*.zip
```

---

## 13. Production build validation before deployment

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

## 14. Uploading files to VPS

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

## 15. Safe archive deployment

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

## 16. Full manual deployment sequence

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

Update production frontend env:

```bash
cat > /home/deploy/apps/Konnaxion/frontend/.env.production <<'EOF'
NEXT_PUBLIC_API_BASE=https://konnaxion.com/api
NEXT_PUBLIC_BACKEND_BASE=https://konnaxion.com
EOF
```

Stop host nginx if necessary:

```bash
sudo systemctl stop nginx || true
sudo systemctl disable nginx || true
```

Backend:

```bash
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

Rebuild/recreate Traefik:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml build --no-cache traefik
docker compose -f docker-compose.production.yml up -d --force-recreate traefik
docker exec backend-traefik-1 cat /etc/traefik/traefik.yml | grep -n "konnaxion\|Host"
docker port backend-traefik-1
```

Restart workers:

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml up -d celeryworker celerybeat flower
docker compose -f docker-compose.production.yml ps
```

Validate from VPS:

```bash
python3 - <<'PY'
import http.client

tests = [
    ("Traefik HTTP konnaxion.com", "127.0.0.1", 80, "/", {"Host": "konnaxion.com"}),
    ("Frontend direct", "127.0.0.1", 3000, "/", {}),
]

for label, host, port, path, headers in tests:
    conn = http.client.HTTPConnection(host, port, timeout=10)
    conn.request("HEAD", path, headers=headers)
    res = conn.getresponse()
    print(label, "=>", res.status, res.reason, dict(res.getheaders()).get("Location"))
    conn.close()
PY
```

Validate from local PowerShell:

```powershell
curl.exe -I https://konnaxion.com
curl.exe -I https://www.konnaxion.com
```

Expected:

```text
HTTP/1.1 200 OK
X-Powered-By: Next.js
```

---

## 17. Useful commands

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

### HTTPS/cert logs

```bash
cd /home/deploy/apps/Konnaxion/backend
docker compose -f docker-compose.production.yml logs --tail=200 traefik | grep -Ei 'acme|certificate|letsencrypt|error|konnaxion'
```

---

## 18. Security notes

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

Minimum security baseline on a fresh replacement VPS:

```text
1. Ubuntu 24.04 LTS.
2. SSH keys only.
3. Disable SSH password login.
4. Disable root SSH login.
5. Cloud firewall:
   - 22 only from your IP
   - 80/443 from anywhere
   - block 3000 publicly
6. UFW:
   - allow OpenSSH
   - allow 80/tcp
   - allow 443/tcp
7. Docker from official repository.
8. No unknown containers.
9. No old systemd Konnaxion services.
10. Backups/snapshots enabled.
```

Recommended cleanup after stabilizing current VPS:

```text
1. Move to a fresh VPS.
2. Rotate Postgres password.
3. Rotate DJANGO_SECRET_KEY.
4. Rotate Django admin password.
5. Rotate SSH keys.
6. Rotate exposed Neon/database credentials.
7. Remove or archive old systemd service files containing secrets.
8. Redeploy from clean Git source only.
```

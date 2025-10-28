# Konnaxion scanners — DEEP

### What’s new
- **Django**: grabs `INSTALLED_APPS`, REST_FRAMEWORK auth/permissions/throttle/pagination, Celery tasks (`@shared_task`), models (`models.Model`), outgoing HTTP calls.
- **Next.js**: detects API route **methods** (GET/POST/etc), lists `app/**/page.*` as UI pages, flags `middleware.ts` & `next.config.ts` presence, outbound fetch/axios.
- **Infra**: parses docker-compose **services** (name, image, ports, depends_on, env keys).

### Run (PowerShell from `C:\MonCode\KonnaxionV14`)
```powershell
python .\scan_infra.py . --out .\manifest_infra.yml --system Konnaxion
python .\scan_django.py .\konnaxion --out .\manifest_back.yml --system Konnaxion
python .\scan_nextjs.py .\next-enterprise --out .\manifest_front.yml --system Konnaxion
python .\merge_manifests.py --out .\combined_manifest.yml --system Konnaxion --in .\manifest_infra.yml .\manifest_back.yml .\manifest_front.yml
python .\manifest_to_structurizr.py --in .\combined_manifest.yml --out .\workspace.dsl --system Konnaxion
```

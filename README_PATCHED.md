# Konnaxion scanners (patchés)

Scripts modulaires prêts à scanner **backend**, **frontend** et **infra**, puis fusionner.

## Installation
```powershell
pip install pyyaml
```

## Exécution (depuis la racine C:\MonCode\KonnaxionV14)
```powershell
python .\scan_infra.py . --out .\manifest_infra.yml --system Konnaxion
python .\scan_django.py .\konnaxion --out .\manifest_back.yml --system Konnaxion
python .\scan_nextjs.py .\next-enterprise --out .\manifest_front.yml --system Konnaxion
python .\merge_manifests.py --out .\combined_manifest.yml --system Konnaxion --in .\manifest_infra.yml .\manifest_back.yml .\manifest_front.yml
python .\manifest_to_structurizr.py --in .\combined_manifest.yml --out .\workspace.dsl --system Konnaxion
```

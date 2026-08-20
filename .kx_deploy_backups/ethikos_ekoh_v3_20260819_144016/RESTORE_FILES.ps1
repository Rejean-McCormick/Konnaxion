$ErrorActionPreference = 'Stop'
$Repo = "C:\\mycode\\Konnaxion\\Konnaxion"
$Backup = "C:\\mycode\\Konnaxion\\Konnaxion\\.kx_deploy_backups\\ethikos_ekoh_v3_20260819_144016\\files"

Write-Host 'Restoring overwritten files...'
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\smart-vote-system-in-konnaxion-technical-specification.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "docs\\Technical-Reference\\EkoH Smart Vote\\smart-vote-system-in-konnaxion-technical-specification.md") (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\smart-vote-system-in-konnaxion-technical-specification.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\konnaxion-smart-vote-weighted-voting-system-structure-and-logic-internal-white-paper.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "docs\\Technical-Reference\\EkoH Smart Vote\\konnaxion-smart-vote-weighted-voting-system-structure-and-logic-internal-white-paper.md") (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\konnaxion-smart-vote-weighted-voting-system-structure-and-logic-internal-white-paper.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\ekoh-system-overview-smart-vote-ecosystem.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "docs\\Technical-Reference\\EkoH Smart Vote\\ekoh-system-overview-smart-vote-ecosystem.md") (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\ekoh-system-overview-smart-vote-ecosystem.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "seed-data\\ethikos\\canada_quebec_public_debates_2026.json")) | Out-Null
Copy-Item -Force (Join-Path $Backup "seed-data\\ethikos\\canada_quebec_public_debates_2026.json") (Join-Path $Repo "seed-data\\ethikos\\canada_quebec_public_debates_2026.json")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\fixtures\\isced_f_2013.json")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\fixtures\\isced_f_2013.json") (Join-Path $Repo "backend\\konnaxion\\ekoh\\fixtures\\isced_f_2013.json")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\management\\commands\\load_isced.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\management\\commands\\load_isced.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\management\\commands\\load_isced.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\recalc.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\tasks\\recalc.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\recalc.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\contextual.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\tasks\\contextual.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\contextual.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\serializers\\profile.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\serializers\\profile.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\serializers\\profile.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\multidimensional_scoring.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\services\\multidimensional_scoring.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\multidimensional_scoring.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\contextual_analysis.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\services\\contextual_analysis.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\contextual_analysis.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\views\\profile.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\views\\profile.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\views\\profile.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\kollective_intelligence\\models.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\kollective_intelligence\\models.py") (Join-Path $Repo "backend\\konnaxion\\kollective_intelligence\\models.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\urls.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\urls.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\urls.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\weight_calculator.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\services\\weight_calculator.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\weight_calculator.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\__init__.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\views\\__init__.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\__init__.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\__init__.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\tests\\__init__.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\__init__.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\__init__.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\models\\__init__.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\__init__.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\models_demo.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\models_demo.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\models_demo.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\schema.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\demo_import\\schema.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\schema.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\importer.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\demo_import\\importer.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\importer.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_api.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\tests\\test_demo_import_api.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_api.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_schema.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\tests\\test_demo_import_schema.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_schema.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_importer.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\tests\\test_demo_importer.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_importer.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\keenkonnect\\user-reputation\\view-reputation-ekoh\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\keenkonnect\\user-reputation\\view-reputation-ekoh\\page.tsx") (Join-Path $Repo "frontend\\app\\keenkonnect\\user-reputation\\view-reputation-ekoh\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\ekoh\\dashboard\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\ekoh\\dashboard\\page.tsx") (Join-Path $Repo "frontend\\app\\ekoh\\dashboard\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\ethikos\\decide\\results\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\ethikos\\decide\\results\\page.tsx") (Join-Path $Repo "frontend\\app\\ethikos\\decide\\results\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\ethikos\\trust\\profile\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\ethikos\\trust\\profile\\page.tsx") (Join-Path $Repo "frontend\\app\\ethikos\\trust\\profile\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\types.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\features\\ethikos\\demo-importer\\types.ts") (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\types.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\api.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\features\\ethikos\\demo-importer\\api.ts") (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\api.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\services\\decide.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\services\\decide.ts") (Join-Path $Repo "frontend\\services\\decide.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\services\\trust.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\services\\trust.ts") (Join-Path $Repo "frontend\\services\\trust.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\hooks\\useReputationEvents.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\hooks\\useReputationEvents.ts") (Join-Path $Repo "frontend\\hooks\\useReputationEvents.ts")

Write-Host 'Removing files created by the overlay...'
if (Test-Path (Join-Path $Repo "PACKAGE_MANIFEST.txt")) { Remove-Item -Force (Join-Path $Repo "PACKAGE_MANIFEST.txt") }
if (Test-Path (Join-Path $Repo "PACKAGE_CHECKSUMS.sha256")) { Remove-Item -Force (Join-Path $Repo "PACKAGE_CHECKSUMS.sha256") }
if (Test-Path (Join-Path $Repo "Konnaxion_Ethikos_Seed_Manager.pyw")) { Remove-Item -Force (Join-Path $Repo "Konnaxion_Ethikos_Seed_Manager.pyw") }
if (Test-Path (Join-Path $Repo "VALIDATION_REPORT.md")) { Remove-Item -Force (Join-Path $Repo "VALIDATION_REPORT.md") }
if (Test-Path (Join-Path $Repo "README_PUSH.md")) { Remove-Item -Force (Join-Path $Repo "README_PUSH.md") }
if (Test-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\migrations\\0004_source_consultation_binding.py")) { Remove-Item -Force (Join-Path $Repo "backend\\konnaxion\\smart_vote\\migrations\\0004_source_consultation_binding.py") }
if (Test-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\reading_service.py")) { Remove-Item -Force (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\reading_service.py") }
if (Test-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\reading.py")) { Remove-Item -Force (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\reading.py") }
if (Test-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\test_reading_service.py")) { Remove-Item -Force (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\test_reading_service.py") }
if (Test-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\source_binding.py")) { Remove-Item -Force (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\source_binding.py") }
if (Test-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\migrations\\0005_demo_import_v3_object_types.py")) { Remove-Item -Force (Join-Path $Repo "backend\\konnaxion\\ethikos\\migrations\\0005_demo_import_v3_object_types.py") }

Write-Host 'File restore complete. Database migrations/imports are NOT rolled back.'
Read-Host 'Press Enter to close'
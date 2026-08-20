$ErrorActionPreference = 'Stop'
$Repo = "C:\\mycode\\Konnaxion\\Konnaxion"
$Backup = "C:\\mycode\\Konnaxion\\Konnaxion\\.kx_deploy_backups\\ethikos_ekoh_v3_20260819_150909\\files"

Write-Host 'Restoring overwritten files...'
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "Konnaxion_Ethikos_Seed_Manager.pyw")) | Out-Null
Copy-Item -Force (Join-Path $Backup "Konnaxion_Ethikos_Seed_Manager.pyw") (Join-Path $Repo "Konnaxion_Ethikos_Seed_Manager.pyw")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "PACKAGE_CHECKSUMS.sha256")) | Out-Null
Copy-Item -Force (Join-Path $Backup "PACKAGE_CHECKSUMS.sha256") (Join-Path $Repo "PACKAGE_CHECKSUMS.sha256")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "PACKAGE_MANIFEST.txt")) | Out-Null
Copy-Item -Force (Join-Path $Backup "PACKAGE_MANIFEST.txt") (Join-Path $Repo "PACKAGE_MANIFEST.txt")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "README_PUSH.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "README_PUSH.md") (Join-Path $Repo "README_PUSH.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "VALIDATION_REPORT.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "VALIDATION_REPORT.md") (Join-Path $Repo "VALIDATION_REPORT.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\config\\settings\\test.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\config\\settings\\test.py") (Join-Path $Repo "backend\\config\\settings\\test.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\db.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\db.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\db.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\fixtures\\isced_f_2013.json")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\fixtures\\isced_f_2013.json") (Join-Path $Repo "backend\\konnaxion\\ekoh\\fixtures\\isced_f_2013.json")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\management\\commands\\load_isced.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\management\\commands\\load_isced.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\management\\commands\\load_isced.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\migrations\\0001_initial.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\migrations\\0001_initial.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\migrations\\0001_initial.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\migrations\\0002_remove_expertisecategory_idx_cat_path_and_more.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\migrations\\0002_remove_expertisecategory_idx_cat_path_and_more.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\migrations\\0002_remove_expertisecategory_idx_cat_path_and_more.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\serializers\\profile.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\serializers\\profile.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\serializers\\profile.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\contextual_analysis.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\services\\contextual_analysis.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\contextual_analysis.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\multidimensional_scoring.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\services\\multidimensional_scoring.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\services\\multidimensional_scoring.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\contextual.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\tasks\\contextual.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\contextual.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\recalc.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\tasks\\recalc.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\tasks\\recalc.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ekoh\\views\\profile.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ekoh\\views\\profile.py") (Join-Path $Repo "backend\\konnaxion\\ekoh\\views\\profile.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\importer.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\demo_import\\importer.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\importer.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\schema.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\demo_import\\schema.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\demo_import\\schema.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\migrations\\0005_demo_import_v3_object_types.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\migrations\\0005_demo_import_v3_object_types.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\migrations\\0005_demo_import_v3_object_types.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\models_demo.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\models_demo.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\models_demo.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_api.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\tests\\test_demo_import_api.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_api.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_schema.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\tests\\test_demo_import_schema.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_import_schema.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_importer.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\ethikos\\tests\\test_demo_importer.py") (Join-Path $Repo "backend\\konnaxion\\ethikos\\tests\\test_demo_importer.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\kollective_intelligence\\models.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\kollective_intelligence\\models.py") (Join-Path $Repo "backend\\konnaxion\\kollective_intelligence\\models.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\migrations\\0002_consultation.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\migrations\\0002_consultation.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\migrations\\0002_consultation.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\migrations\\0004_source_consultation_binding.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\migrations\\0004_source_consultation_binding.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\migrations\\0004_source_consultation_binding.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\__init__.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\models\\__init__.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\__init__.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\source_binding.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\models\\source_binding.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\models\\source_binding.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\reading_service.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\services\\reading_service.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\reading_service.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\weight_calculator.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\services\\weight_calculator.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\services\\weight_calculator.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\__init__.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\tests\\__init__.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\__init__.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\test_reading_service.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\tests\\test_reading_service.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\tests\\test_reading_service.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\urls.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\urls.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\urls.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\__init__.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\views\\__init__.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\__init__.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\reading.py")) | Out-Null
Copy-Item -Force (Join-Path $Backup "backend\\konnaxion\\smart_vote\\views\\reading.py") (Join-Path $Repo "backend\\konnaxion\\smart_vote\\views\\reading.py")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\ekoh-system-overview-smart-vote-ecosystem.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "docs\\Technical-Reference\\EkoH Smart Vote\\ekoh-system-overview-smart-vote-ecosystem.md") (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\ekoh-system-overview-smart-vote-ecosystem.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\konnaxion-smart-vote-weighted-voting-system-structure-and-logic-internal-white-paper.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "docs\\Technical-Reference\\EkoH Smart Vote\\konnaxion-smart-vote-weighted-voting-system-structure-and-logic-internal-white-paper.md") (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\konnaxion-smart-vote-weighted-voting-system-structure-and-logic-internal-white-paper.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\smart-vote-system-in-konnaxion-technical-specification.md")) | Out-Null
Copy-Item -Force (Join-Path $Backup "docs\\Technical-Reference\\EkoH Smart Vote\\smart-vote-system-in-konnaxion-technical-specification.md") (Join-Path $Repo "docs\\Technical-Reference\\EkoH Smart Vote\\smart-vote-system-in-konnaxion-technical-specification.md")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\ekoh\\dashboard\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\ekoh\\dashboard\\page.tsx") (Join-Path $Repo "frontend\\app\\ekoh\\dashboard\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\ethikos\\decide\\results\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\ethikos\\decide\\results\\page.tsx") (Join-Path $Repo "frontend\\app\\ethikos\\decide\\results\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\ethikos\\trust\\profile\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\ethikos\\trust\\profile\\page.tsx") (Join-Path $Repo "frontend\\app\\ethikos\\trust\\profile\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\app\\keenkonnect\\user-reputation\\view-reputation-ekoh\\page.tsx")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\app\\keenkonnect\\user-reputation\\view-reputation-ekoh\\page.tsx") (Join-Path $Repo "frontend\\app\\keenkonnect\\user-reputation\\view-reputation-ekoh\\page.tsx")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\api.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\features\\ethikos\\demo-importer\\api.ts") (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\api.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\types.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\features\\ethikos\\demo-importer\\types.ts") (Join-Path $Repo "frontend\\features\\ethikos\\demo-importer\\types.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\hooks\\useReputationEvents.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\hooks\\useReputationEvents.ts") (Join-Path $Repo "frontend\\hooks\\useReputationEvents.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\services\\decide.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\services\\decide.ts") (Join-Path $Repo "frontend\\services\\decide.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "frontend\\services\\trust.ts")) | Out-Null
Copy-Item -Force (Join-Path $Backup "frontend\\services\\trust.ts") (Join-Path $Repo "frontend\\services\\trust.ts")
New-Item -ItemType Directory -Force -Path (Split-Path (Join-Path $Repo "seed-data\\ethikos\\canada_quebec_public_debates_2026.json")) | Out-Null
Copy-Item -Force (Join-Path $Backup "seed-data\\ethikos\\canada_quebec_public_debates_2026.json") (Join-Path $Repo "seed-data\\ethikos\\canada_quebec_public_debates_2026.json")

Write-Host 'File restore complete. Database migrations/imports are NOT rolled back.'
Read-Host 'Press Enter to close'
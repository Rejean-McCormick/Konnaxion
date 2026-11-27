function Set-KoaliKonnaxionTestEnvironment {
    param([string]$Python, [string]$Backend)

    $database = $env:KOALI_KX_TEST_DATABASE_URL
    $redis = $env:KOALI_KX_TEST_REDIS_URL
    if ($database -cnotmatch '\Apostgresql://koali_test:[a-fA-F0-9]{48}@127\.0\.0\.1:15433/koali_konnaxion_test\z' -or
        $redis -cne 'redis://127.0.0.1:16380/0') {
        throw 'Configuration isolee Konnaxion/Koali manquante ou inattendue.'
    }

    $env:DATABASE_URL = $database
    $env:KONNAXION_WORLDS_DATABASE_URL = $database
    $env:REDIS_URL = $redis

    $verify = @'
from django.conf import settings
from django.db import connection

db = settings.DATABASES.get("default", {})
if set(settings.DATABASES) != {"default"}:
    raise SystemExit("Alias Django inattendu.")
if (db.get("HOST"), str(db.get("PORT")), db.get("NAME"), db.get("USER")) != (
    "127.0.0.1", "15433", "koali_konnaxion_test", "koali_test"
):
    raise SystemExit("Cible PostgreSQL Django inattendue.")
if settings.CELERY_BROKER_URL != "redis://127.0.0.1:16380/0" or settings.CELERY_RESULT_BACKEND != settings.CELERY_BROKER_URL:
    raise SystemExit("Cible Redis Django inattendue.")
with connection.cursor() as cursor:
    cursor.execute("SELECT current_database(), current_user")
    if cursor.fetchone() != ("koali_konnaxion_test", "koali_test"):
        raise SystemExit("Identite PostgreSQL inattendue.")
print("Konnaxion/Koali : PostgreSQL et Redis de test confirmes.")
'@
    Push-Location -LiteralPath $Backend
    try {
        # Keep the source out of the native argument list for Windows PowerShell.
        $verify | & $Python -
        if ($LASTEXITCODE -ne 0) {
            throw 'Le controle de la cible Konnaxion a echoue avant les migrations.'
        }
    }
    finally { Pop-Location }
}

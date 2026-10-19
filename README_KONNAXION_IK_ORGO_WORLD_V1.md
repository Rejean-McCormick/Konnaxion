# IK Konnaxion → Orgo : en-tête World ciblé

À extraire à la racine de `C:\mycode\Konnaxion\Konnaxion`.

Le snapshot Konnaxion construit `target.world=fp-...` dans la commande IK. Le snapshot Orgo lit le contexte de World dans l'en-tête HTTP `X-Orgo-World-Key`, sinon il utilise `main` et refuse les commandes avec `target.world` différent. Le transport Konnaxion n'envoyait pas cet en-tête.

Ce patch ajoute `X-Orgo-World-Key` **uniquement si** `target.world` est renseigné, avec une validation stricte identique à l'exigence Orgo (lettres minuscules, chiffres, tirets; 1 à 64 caractères). Les valeurs invalides refusent l'envoi (`IK_TARGET_INVALID`) plutôt que de traverser la frontière HTTP.

**Aucun jeton, URL, service ou base n'est modifié à l'extraction.** Le transport ne change qu'au moment d'une future émission IK, qui reste désactivée tant que les variables manquent.

Test ciblé avec Django disponible :

```powershell
cd C:\mycode\Konnaxion\Konnaxion\backend
uv run --no-sync python -m unittest konnaxion.ethikos.tests.test_interaction_kernel_transport_world
```

Attention : un `target.world` valide n'est pas une permission suffisante. Le jeton Orgo doit toujours viser la bonne organisation et disposer des portées requises. Pas de test E2E revendiqué avant exécution sur les services réels.

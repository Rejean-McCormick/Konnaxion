# Konnaxion Ethikos/EkoH V3.2 overlay

Target repo:

`C:\mycode\Konnaxion\Konnaxion`

V3.2 fixes the Neon pooled-test failure after V3.1:

- test settings remove PostgreSQL startup `search_path` options;
- fresh EkoH / Smart Vote migrations select `ekoh_smartvote, public`
  transactionally;
- deploy logs redact database passwords/tokens;
- the GUI adds **Copier journal**;
- error dialogs are compact; the complete redacted traceback stays in the log.

The reported V3.1 run already applied `smart_vote.0004` successfully. V3.2 is
safe to rerun: Django migrations are idempotent and the demo seed uses
`replace_scenario`.

Use **TOUT FAIRE**.

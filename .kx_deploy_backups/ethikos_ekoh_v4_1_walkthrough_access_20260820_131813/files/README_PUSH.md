# Konnaxion Ethikos/EkoH V3.3 repair overlay

Target repo:

`C:\mycode\Konnaxion\Konnaxion`

V3.3 addresses the five failures from the V3.2 targeted test run.

Changes:
- Reset API returns the stable `{ok:false,error:...}` shape for a missing scenario key.
- Standalone reset enters the EkoH/Smart Vote schema scope before deleting tracked bindings.
- Reset safety test supplies the required `EthikosTopic.created_by`.
- v1/v2 schema compatibility tests restore legacy `weighted_value` correctly.
- Smart Vote reading test explicitly enters `ekoh_smartvote_db_scope`.
- Test execution uses `--create-db` so an old reused test database cannot preserve a split/obsolete schema.
- EkoH taxonomy model index is aligned with its final migration state.
- DemoScenarioImport `object_type` metadata is aligned with migration 0005.
- The existing **Copier journal** button and credential redaction remain enabled.

The production database already has Smart Vote migration 0004 applied, so this
repair does not need to undo anything. Run **TOUT FAIRE** again.

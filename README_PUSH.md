# Konnaxion Ethikos / EkoH V4.1 — Walkthrough + Rating Access

This overlay upgrades the V4 walkthrough and adds a small reusable EkoH rating-disclosure layer.

## What V4.1 adds

### EkoH rating access

EkoH now separates three concerns:

```text
Identity visibility     -> ConfidentialitySetting
Rating visibility       -> public | scoped | private
Contextual influence    -> Smart Vote reading/lens
```

New EkoH-owned models:

```text
RatingVisibilitySetting
RatingAccessScope
RatingScopeSubject
RatingAccessGrant
```

Canonical resolver:

```python
resolve_rating_access(viewer=viewer, subject=subject)
```

Access levels:

```text
ratings
history
```

The design deliberately does not add business roles such as CEO, Supervisor or Manager. A consuming module maps its organisation/team/project context to a generic EkoH scope.

### Public rating policy

The Canada/Québec walkthrough seed explicitly marks its 31 demo/public EkoH profiles as:

```json
"rating_visibility": "public"
```

This is intentional for transparent walkthrough review. It does not make all EkoH profiles public globally.

### Reusable frontend

New generic EkoH frontend surface:

```text
frontend/services/ekoh.ts
frontend/modules/ekoh/components/EkohRatingDrawer.tsx
frontend/modules/ekoh/components/EkohDomainRatings.tsx
frontend/modules/ekoh/components/EkohAccessNotice.tsx
```

Ethikos now wraps the generic EkoH drawer and adds Smart Vote question context separately.

### Smart Vote disclosure boundary

Aggregate Smart Vote arithmetic is unchanged. Participant-level EkoH-derived detail is returned only when the caller is authorized by the EkoH rating-disclosure resolver.

### V4 walkthrough retained

The V4 narrative remains intact:

- Canada–U.S. autonomy debate;
- King Klown infrastructure proposal;
- Réjean McCormick technical interrogation;
- moderation event;
- emergent Trump question;
- declared King Klown recusal from advisory reading only;
- baseline vs relevant-expertise reading;
- individual EkoH ratings for the public/demo actors.

## Database

V4.1 adds one additive EkoH migration:

```text
backend/konnaxion/ekoh/migrations/0003_rating_visibility_and_access.py
```

It does not rename or move existing score tables.

## Documentation

New canonical contract:

```text
docs/Technical-Reference/Kintsugi_Kompendio/ethiKos_Kintsugi_Update/
27_EKOH_RATING_VISIBILITY_AND_ACCESS_CONTRACT.md
```

ADR-012 records the ownership decision: EkoH owns rating disclosure but does not become a second Konnaxion RBAC system.

## Expected seed inventory

```text
31 actors
8 categories
14 topics
67 stances
78 arguments
95 argument-source links
31 EkoH profiles
79 topic relevance rows
1 advisory-only declared recusal
31 explicit public rating-visibility policies
```

## Deployment

Use the supplied Windows updater and choose **TOUT FAIRE — V4.1**.

The updater performs:

1. repository validation and backup;
2. overlay installation + SHA-256 verification;
3. Django migration of the additive EkoH access tables;
4. Django checks and migration drift check;
5. targeted EkoH / Ethikos / Smart Vote tests;
6. seed preview + import;
7. runtime verification of the walkthrough, public rating policy and recusal;
8. frontend TypeScript check;
9. Next.js production build.

No manual database edits are required.

## V4.1.2 display-name hotfix

Demo actor imports now persist `display_name` into Konnaxion `User.name`, while Smart Vote and EkoH profile serialization reject the inherited `"None None"` artefact and fall back safely to the username. No schema or migration change.

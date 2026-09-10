# Konnaxion — Upgrade To-To

**Document ID:** `UPGRADE_TO_TO.md`  
**Scope:** conservative upgrade of the existing Konnaxion platform  
**Status:** proposed  
**Principle:** strengthen existing contracts without introducing a new application, new product surface, or parallel source of truth.

---

## 1. Purpose

This upgrade strengthens Konnaxion in two existing areas:

1. **KonnectED / CertifiKation evaluation semantics**
2. **EkoH evidence intake, scoring traceability, and governance**

The upgrade is intentionally conservative. Konnaxion is already stable; therefore the default rule is:

> **Preserve existing models, routes, UI surfaces, ownership boundaries, and runtime behavior unless a change is required to close a concrete ambiguity or integrity gap.**

This document does not define a new application.

---

## 2. Current baseline

Konnaxion already contains the required structural foundations.

### KonnectED / CertifiKation

Existing concepts include:

- `CertificationPath`
- `Evaluation`
- `PeerValidation`
- `Portfolio`
- `InteropMapping`
- certification registration, preparation, result and dashboard surfaces

`Evaluation` already provides:

- a user binding;
- a certification path;
- `raw_score`;
- a flexible `metadata` object.

The flexible metadata field is sufficient for the proposed upgrade without requiring a schema migration.

### EkoH

EkoH already provides:

- canonical expertise taxonomy;
- per-user domain expertise scores;
- multidimensional scoring based on:
  - `quality`;
  - `expertise`;
  - `frequency`;
- score configuration;
- score history;
- contextual-analysis audit;
- rating visibility;
- scoped access controls;
- dedicated score recalculation.

EkoH scoring is already explicitly separate from Smart Vote consumption.

---

## 3. Upgrade goals

The upgrade SHALL:

1. make evaluation results more interpretable than a raw score;
2. keep assessment evidence distinct from certification/attestation decisions;
3. define what evidence is allowed to influence EkoH;
4. preserve provenance and scope for evidence that affects reputation;
5. make score changes traceable;
6. preserve privacy and consent boundaries;
7. support correction, expiry, revocation and contestation;
8. prevent derived downstream signals from feeding back into EkoH as new expertise evidence;
9. remain backward-compatible wherever practical.

---

## 4. Non-goals

This upgrade SHALL NOT:

- create a new top-level Konnaxion application;
- create a second evaluation engine beside the existing CertifiKation flow;
- create a second reputation engine beside EkoH;
- add a general-purpose human score;
- add public ranking by default;
- redesign the current Konnaxion UI;
- require new certification pages;
- introduce a new mandatory database schema in the first implementation phase;
- allow external or internal producers to write `UserExpertiseScore` directly;
- allow AI analysis to silently mutate canonical expertise scores;
- allow Smart Vote results or voting influence to become canonical EkoH expertise evidence.

---

## 5. Upgrade A — Evaluation result semantics

### 5.1 Raw score remains audit data

`Evaluation.raw_score` MAY remain unchanged for compatibility.

It SHALL NOT be treated as the complete semantic interpretation of a person's competence.

A raw score answers:

> What numerical result was observed in this evaluation?

It does not answer:

> What is this person's general value, intelligence, authority, or competence in unrelated contexts?

### 5.2 Canonical optional metadata

The existing `Evaluation.metadata` field SHOULD support the following canonical keys when applicable:

```json
{
  "status": "completed",
  "assessment_context": "...",
  "rule_version": "...",
  "confirmed_level": "...",
  "highest_explored_level": "...",
  "confidence": "...",
  "validity_conditions": [],
  "non_validity_conditions": [],
  "interpretation": {
    "strengths": [],
    "limitations": [],
    "uncertainties": [],
    "recommendations": []
  },
  "consent_scope": "...",
  "review_ref": "...",
  "source_ref": "..."
}
```

These keys are optional and additive.

Existing metadata such as:

- `session_id`;
- `full_name`;
- `agreed_terms`;
- `delivery_mode`;
- `proctored`;
- `target_date`;
- `score_percent`;
- `max_score`;
- `appeal_status`;
- `peer_validation_required`;

remains valid.

### 5.3 Interpretation rules

An evaluation result SHOULD distinguish:

- **confirmed level** — level supported with sufficient confidence;
- **highest explored level** — highest level meaningfully tested;
- **confidence / uncertainty** — strength of the conclusion;
- **validity conditions** — contexts in which the result applies;
- **non-validity conditions** — conclusions the result does not support.

The system SHOULD prefer statements such as:

> Competence is confirmed to level X in context Y.

over statements such as:

> This person is competent in general.

### 5.4 Evaluation versus certification

The following boundary SHALL remain explicit:

```text
Evaluation
    ↓ provides evidence
Certification review / policy
    ↓ decides
Certification / attestation state
```

An evaluation MAY recommend certification review.

An evaluation SHALL NOT implicitly create or guarantee an attestation solely because a score threshold was reached.

---

## 6. Upgrade B — Evaluation lifecycle and contestability

Evaluation metadata SHOULD use explicit lifecycle states where applicable.

Recommended states:

```text
scheduled
in_progress
completed
corrected
contested
expired
cancelled
```

A corrected evaluation SHOULD preserve the reference to the prior result.

A contested evaluation SHOULD remain available for audit but SHOULD NOT be silently rewritten as if no contest occurred.

Where a result can materially affect certification, reputation or access, Konnaxion SHOULD expose or retain a review/appeal reference.

---

## 7. Upgrade C — EkoH evidence intake contract

### 7.1 Core rule

EkoH SHALL remain the sole authority for canonical EkoH reputation scores.

Evidence producers provide evidence or normalized evidence signals.

They do not provide authoritative final EkoH scores.

```text
source fact
    ↓
evidence
    ↓
qualification / admissibility
    ↓
EkoH metric aggregation
    ↓
EkoH scoring
    ↓
UserExpertiseScore
```

### 7.2 Minimum evidence envelope

Any future evidence source that is allowed to affect EkoH SHOULD be representable by an internal envelope equivalent to:

```text
evidence_id
source_namespace
source_ref
subject_id
domain_code
evidence_type
observed_at
valid_until
provenance
status
consent_scope
reliability
domain_relevance
supersedes
audit_ref
idempotency_key
```

This is a **contract**, not necessarily a new database model.

The first implementation SHOULD use an internal DTO, typed mapping, dataclass or equivalent boundary object before considering persistence.

### 7.3 Evidence status

Evidence status SHOULD be explicit.

Recommended states:

```text
submitted
under_review
admissible
partially_admissible
rejected
disputed
expired
revoked
superseded
```

Only admissible or explicitly partially admissible evidence MAY influence EkoH scoring.

### 7.4 Verification is not scoring

Konnaxion SHALL preserve this distinction:

```text
evidence exists
≠
evidence is authentic
≠
evidence is relevant to this domain
≠
evidence is admissible
≠
evidence increases the EkoH score
```

The final reputation impact remains an EkoH scoring decision.

---

## 8. Upgrade D — Governed metric aggregation

EkoH currently scores three normalized dimensions:

```text
quality
expertise
frequency
```

The governed evidence collector SHOULD aggregate admissible evidence into these existing dimensions rather than create a parallel scoring system.

The collector SHALL:

1. ignore rejected, revoked or expired evidence unless policy explicitly says otherwise;
2. resolve superseded/duplicate evidence before aggregation;
3. respect domain mapping;
4. respect consent and permitted use;
5. keep source provenance available for audit;
6. return `None` when complete trustworthy metrics cannot be produced.

It SHALL NOT fabricate zero-valued metrics merely because evidence is unavailable.

This preserves the current fail-safe recalculation behavior.

---

## 9. Upgrade E — Score authority and write boundary

Canonical EkoH score mutation SHOULD occur only through the existing EkoH scoring service or a clearly designated wrapper around it.

Direct writes to:

```text
UserExpertiseScore.raw_score
UserExpertiseScore.weighted_score
```

from unrelated modules SHOULD be prohibited by convention and tests.

Recommended write path:

```text
governed evidence collector
        ↓
quality / expertise / frequency
        ↓
compute_user_domain_score(...)
        ↓
UserExpertiseScore
```

A producer MAY submit evidence.

A producer SHALL NOT decide the final normalized domain score.

---

## 10. Upgrade F — Traceability

Every material score change SHOULD be explainable.

At minimum the system SHOULD be able to recover:

- user;
- domain;
- old score;
- new score;
- reason;
- evidence references or aggregation reference;
- scoring configuration/rule version;
- timestamp.

Existing `ScoreHistory` remains the canonical score-history mechanism.

Where additional structured context is useful, existing JSON-capable audit structures SHOULD be preferred before introducing new tables.

---

## 11. Upgrade G — Corrections, revocation and supersession

Evidence MAY change after initial acceptance.

The system SHOULD support these semantics:

```text
correction
revocation
expiry
supersession
```

A source correction SHALL NOT silently overwrite historical meaning.

Instead:

```text
old evidence
    ↓ corrected/revoked/superseded
new authoritative state
    ↓
EkoH re-evaluation
    ↓
new score + history entry
```

The evidence boundary MUST NOT directly patch the final EkoH score to compensate.

The score is recomputed through the canonical scoring path.

---

## 12. Upgrade H — Privacy and consent

Konnaxion SHALL preserve the distinction between:

```text
raw evidence visibility
evaluation visibility
EkoH score visibility
EkoH history visibility
identity visibility
```

A public EkoH score does not imply that the underlying evidence is public.

A public certification does not imply that all evaluation details are public.

An evidence envelope SHOULD carry sufficient consent/use information to prevent a downstream consumer from assuming broader rights than were granted at collection time.

Existing EkoH confidentiality, rating visibility and scoped access controls remain authoritative for EkoH disclosure.

---

## 13. Upgrade I — AI boundary

AI-assisted analysis MAY:

- classify evidence;
- suggest domain mapping;
- summarize evidence;
- identify anomalies;
- recommend review;
- propose contextual interpretation.

AI-assisted analysis SHALL NOT, by default:

- establish authoritative truth;
- silently mark disputed evidence as accepted;
- directly mutate canonical EkoH scores;
- issue certification;
- make an irreversible high-impact decision without the applicable governance path.

The existing non-authoritative contextual-analysis behavior SHOULD remain the default pattern.

---

## 14. Upgrade J — No feedback loop from downstream derived signals

Derived downstream outputs SHALL NOT automatically become new canonical EkoH expertise evidence.

In particular:

```text
EkoH expertise
    ↓
contextual downstream use
    ↓
derived influence / reading / result
```

MUST NOT become:

```text
derived influence / reading / result
    ↓
new EkoH expertise evidence
    ↓
higher EkoH expertise
    ↓
stronger derived influence
    ↓
...
```

Any downstream object reused as evidence must have an independent evidentiary basis and explicit policy authorizing that use.

Circular self-amplification is prohibited.

---

## 15. Implementation strategy

### Phase 0 — Documentation lock

**Risk:** minimal  
**Database migration:** none  
**UI change:** none

Actions:

1. adopt this document as the upgrade contract;
2. document evaluation-versus-certification ownership;
3. document EkoH score-write authority;
4. document the evidence-intake envelope;
5. document the no-feedback-loop invariant.

This phase can be completed without changing runtime behavior.

### Phase 1 — Backward-compatible hardening

**Risk:** low  
**Database migration:** none expected  
**UI change:** none required

Actions:

1. add validation/helpers for canonical `Evaluation.metadata` keys;
2. add tests proving legacy metadata remains valid;
3. add tests proving AI/context analysis cannot write EkoH scores;
4. add tests proving non-EkoH modules cannot bypass the canonical scoring path;
5. standardize score-history reasons;
6. add explicit tests for revoked/expired/superseded evidence behavior when the collector is implemented.

### Phase 2 — Governed evidence collector

**Risk:** controlled  
**Database migration:** avoid unless justified by real persistence requirements  
**UI change:** none required

Implement the currently missing governed evidence aggregation behind `_collect_metrics()`.

The collector SHOULD:

```text
collect eligible evidence
→ validate status/provenance/scope
→ remove duplicates/superseded records
→ map to EkoH domain
→ aggregate quality/expertise/frequency
→ return metrics
```

If evidence is incomplete or not trustworthy:

```python
return None
```

No score is overwritten.

### Phase 3 — Optional structured persistence

Only introduce a persistent evidence table if actual product requirements prove that references and existing source objects are insufficient.

A schema migration SHALL NOT be justified merely to mirror information already owned elsewhere in Konnaxion.

---

## 16. Compatibility requirements

The upgrade SHOULD preserve:

- existing frontend routes;
- existing CertifiKation pages;
- existing Evaluation API routes;
- existing EkoH profile API behavior;
- existing score normalization;
- existing rating visibility behavior;
- existing scoped rating access;
- existing DB schema unless a later phase explicitly requires change.

Existing clients that only understand `raw_score` and legacy `metadata` SHALL continue to function.

New interpretation metadata is additive.

---

## 17. Required tests

Before activating runtime changes, the following invariants SHOULD be covered:

### Evaluation

- legacy Evaluation payloads remain readable;
- canonical metadata keys are optional;
- invalid canonical values fail predictably when validation is enabled;
- corrected/contested state does not erase prior audit information.

### EkoH

- missing evidence returns no scoring metrics rather than synthetic zeroes;
- rejected evidence cannot affect scores;
- revoked evidence triggers re-evaluation rather than direct score mutation;
- duplicate/superseded evidence is not double-counted;
- scoring remains bounded to `0..1`;
- missing required scoring axes fail closed;
- AI/context analysis does not mutate `UserExpertiseScore`;
- score changes produce traceable history;
- unauthorized consumers cannot access restricted scores/history.

### Boundary

- no downstream derived signal can automatically re-enter EkoH as expertise evidence;
- external/internal evidence producers cannot directly author canonical EkoH scores.

---

## 18. Definition of done

The upgrade is complete when all of the following are true:

1. Konnaxion has one evaluation truth, not parallel evaluators.
2. Evaluation results have optional structured interpretation semantics.
3. Certification remains a distinct decision from evaluation.
4. EkoH has one canonical score-write path.
5. Evidence entering EkoH is provenance-aware, scoped and status-aware.
6. Missing evidence cannot erase existing reputation.
7. Correction/revocation/supersession can trigger deterministic re-evaluation.
8. Score changes are traceable.
9. Privacy of source evidence remains independent from score visibility.
10. AI analysis remains advisory by default.
11. Derived downstream signals cannot create reputation feedback loops.
12. Existing stable Konnaxion pages and APIs continue to operate.

---

## 19. Canonical architecture statement

> **Konnaxion keeps source facts, evaluation, certification, evidence qualification, reputation scoring and downstream use as distinct authority boundaries. Existing components are strengthened rather than duplicated.**

And operationally:

```text
KonnectED / CertifiKation
    evaluation evidence
        ↓
governed evidence boundary
        ↓
EkoH metric aggregation
        ↓
EkoH canonical scoring
        ↓
authorized downstream consumption
```

No new application is required for this upgrade.

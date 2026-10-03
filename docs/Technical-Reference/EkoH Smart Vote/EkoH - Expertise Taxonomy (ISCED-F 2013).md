# EkoH — Expertise Taxonomy (UNESCO ISCED-F 2013 / CITE-F 2013)

**Status:** current EkoH taxonomy reference  
**Version pinned:** ISCED-F 2013  
**Canonical owner:** `konnaxion.ekoh`

## Purpose

EkoH uses **UNESCO ISCED-F 2013** (*International Standard Classification of Education — Fields of Education and Training 2013*; **CITE-F 2013** in French) as the external classification backbone for expertise domains.

ISCED-F classifies **fields of education and training**. EkoH reuses that hierarchy to organize domain-bounded expertise. An ISCED-F category is therefore a **taxonomy identifier**; by itself it is not a credential, an expertise score, a merit score, an ethics score, or a Smart Vote weight.

## Official classification versus the EkoH profile

The complete ISCED-F 2013 classification contains **11 broad fields**, **29 narrow fields**, and about **80 detailed fields**. It includes broad field `00` (*Generic programmes and qualifications*) and special coding categories used for classification completeness.

The default **EkoH domain-bearing profile** is intentionally narrower:

| Level | ISCED-F code shape | EkoH profile | EkoH `depth` |
|---|---|---:|---:|
| Broad field | 2 digits | **10** (`01`–`10`) | `0` |
| Narrow field | 3 digits | **26** substantive fields | `1` |
| Detailed field | 4 digits | **77** substantive fields | `2` |
| **Total** | — | **113 categories** | — |

The EkoH profile excludes broad field `00` (*Generic programmes and qualifications*), field-unknown codes, and the optional not-further-defined, interdisciplinary and not-elsewhere-classified coding buckets from **default expertise scoring**. These are valid ISCED-F coding mechanisms, but they are not treated as expertise-bearing domains by default.

## Canonical data model

`ExpertiseCategory` stores the hierarchy with:

```text
code    official ISCED-F code
name    official field label
parent  parent ExpertiseCategory
depth   0 broad / 1 narrow / 2 detailed
path    PostgreSQL ltree hierarchy path
```

Examples:

```text
03    Social sciences, journalism and information
└── 031    Social and behavioural sciences
    └── 0312    Political sciences and civics

06    Information and Communication Technologies
└── 061    Information and Communication Technologies
    └── 0613    Software and applications development and analysis

07    Engineering, manufacturing and construction
└── 071    Engineering and engineering trades
    └── 0714    Electronics and automation
```

Official ISCED-F codes and labels must remain unchanged. Any future Konnaxion-specific finer-grained expertise taxonomy must use an explicit extension namespace or mapping and must not masquerade as an official ISCED-F code.

## Implementation anchors

```text
backend/konnaxion/ekoh/models/taxonomy.py
backend/konnaxion/ekoh/fixtures/isced_f_2013.json
backend/konnaxion/ekoh/management/commands/load_isced.py
```

The supported synchronization command is:

```text
python manage.py load_isced
```

The loader is expected to upsert the taxonomy without deleting existing `UserExpertiseScore` rows. The profile invariants are **10 broad / 26 narrow / 77 detailed / 113 total**, with unique codes and valid parent links.

## Relationship to EkoH scoring and Smart Vote

EkoH scores remain **domain-bounded**. A high score in one ISCED-F category does not create authority in another category.

Smart Vote may declare `ConsultationRelevance` against one or more EkoH categories, but:

```text
ISCED-F category ≠ expertise evidence
ISCED-F category ≠ expertise score
EkoH expertise score ≠ universal voting power
Smart Vote relevance ≠ source ballot
```

The taxonomy supplies stable domain identifiers. Evidence, score computation, disclosure policy and Smart Vote readings remain governed by their own explicit contracts.

## Versioning rule

Konnaxion is pinned to **ISCED-F 2013**. The UNESCO Institute for Statistics launched a comprehensive revision process in 2026, with proposed revised frameworks targeted for UNESCO consideration in 2027. Until a successor is formally adopted and Konnaxion performs an explicit migration/crosswalk, existing EkoH categories remain versioned as ISCED-F 2013.

A future migration must preserve historical interpretability of existing scores and readings; it must not silently reinterpret an old category under a new classification.

## Authoritative external references

- UNESCO Institute for Statistics — *ISCED Fields of Education and Training 2013 (ISCED-F 2013)*: https://uis.unesco.org/sites/default/files/documents/isced-fields-of-education-and-training-2013-en.pdf
- UNESCO Institute for Statistics — ISCED revision: https://www.uis.unesco.org/en/methods-and-tools/isced/revision


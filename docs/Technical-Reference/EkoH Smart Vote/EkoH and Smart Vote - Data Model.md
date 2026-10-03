# EkoH and Smart Vote — Data Model

## Canonical EkoH models

```text
ExpertiseCategory
UserExpertiseScore
UserEthicsScore
ScoreConfiguration
ScoreHistory
ConfidentialitySetting
RatingVisibilitySetting
RatingAccessScope
RatingScopeSubject
RatingAccessGrant
ContextAnalysisLog
```

## ExpertiseCategory taxonomy contract

`ExpertiseCategory` is the hierarchical **ISCED-F 2013 / CITE-F 2013** domain catalogue used by EkoH. The active profile contains **113 categories: 10 broad (`01`–`10`), 26 substantive narrow and 77 substantive detailed fields**.

Key taxonomy fields are:

```text
code    official ISCED-F code
name    official label
parent  parent category
depth   0 / 1 / 2
path    ltree hierarchy path
```

The full ISCED-F classification is broader (11 / 29 / about 80). EkoH intentionally excludes generic and special catch-all coding categories from default expertise scoring. See `EkoH - Expertise Taxonomy (ISCED-F 2013).md`.

## Canonical Smart Vote context models

```text
Consultation
ConsultationRelevance
SourceConsultationBinding
```

## Current Smart Vote ballot/aggregate models

```text
VoteModality
Vote
VoteResult
VoteLedger
```

These physical models exist in the current code. Their use must obey the architecture rule that source participation and derived weighting are distinct. `weighted_value` and weighted aggregate state are not a substitute for a versioned reading contract.

## Binding

`SourceConsultationBinding` uses:

```text
source_type
source_id
source_key
consultation
metadata_json
```

For ethiKos:

```text
source_type = "ethikos_topic"
source_id   = string form of EthikosTopic primary key
```

This preserves source ownership and avoids title-based matching.

## Relevance

`ConsultationRelevance` binds a Smart Vote consultation to an EkoH `ExpertiseCategory` with a weight and optional criteria metadata.

Input validation should ensure the relevance vector is non-negative and normalized according to the declared lens policy.

## Reading

A reading is not currently represented by a dedicated persisted model in the inspected code; the ethiKos reading endpoint computes it on demand. Durable publication/replay requires persistent or recoverable inputs/reading artifacts.

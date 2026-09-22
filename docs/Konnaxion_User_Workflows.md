# Konnaxion — User Workflows

## 1. Scope

These workflows describe current Konnaxion product surfaces without treating every UI area as an independent architecture system. Navigation ownership, technical route ownership and backend state ownership are distinct concepts.

The canonical visible brand spelling is **ethiKos**.

## 2. Shared entry and navigation

```text
user
→ Konnaxion frontend
→ authenticated/public context
→ suite switcher / sidebar
→ product surface
→ Konnaxion API/service owner
→ result
```

The suite switcher is organized as:

```text
Core experiences:   ethiKos · keenKonnect · KonnectED · Kreative
Shared capabilities: EkoH · Team Builder
Operations:          Insights · KonTrol
```

Two route families deliberately differ from their sidebar label/owner:

- `/konsensus/*` opens under **ethiKos**;
- `/reports/*` opens under **Insights**.

Shared navigation/search/auth may cross product surfaces, but domain mutations remain owned by their backend domain.

## 3. ethiKos — deliberate

```text
open topic
→ read source/context
→ inspect argument graph
→ add argument/reply/source when authorized
→ optional stance update
→ moderated/audited ethiKos state
```

Topic stance and argument-level impact are separate interactions.

## 4. ethiKos — decide and Konsensus

```text
open public/expert decision
→ inspect source participation
→ optionally open Konsensus from Decide
→ inspect baseline / collective state
→ optional Smart Vote reading request
→ keep advisory reading distinct from source result
→ review result / methodology
```

Konsensus is part of the ethiKos decision experience even though its technical route is `/konsensus/*`. It is not an EkoH suite.

If no Smart Vote reading exists, the UI displays no derived reading rather than inventing one.

## 5. EkoH profile and contextual influence

```text
viewer requests profile/context
→ identity confidentiality policy
→ rating-access policy
→ allowed EkoH fields
→ contextual expertise/reputation response
```

The viewer does not receive private rating detail merely because identity is visible. Contextual influence is specific to the relevant domain/question/lens; it is not a global voting-power property.

## 6. Smart Vote contextual reading

```text
source topic
→ explicit SourceConsultationBinding
→ consultation relevance vector
→ EkoH context
→ lens hash + input snapshot identity
→ baseline + advisory reading
```

A contextual reading weight is specific to the consultation/lens. It is not a global property of the person.

## 7. keenKonnect

```text
browse/create project
→ project/workspace context
→ optional AI team recommendation/discovery
→ resources/tasks/messages/impact work
→ domain services
→ project state
```

EkoH context may be displayed for people but does not own the project. **AI Team Matching** recommends/discovers teams or partners for project intent; it is distinct from the reusable Team Builder composition engine.

## 8. KonnectED

```text
browse learning resource/path
→ consume/contribute/evaluate
→ peer validation or certification workflow when applicable
→ discussion / learning collaboration
→ optional Create team flow
→ portfolio/progress state
```

The visible action at `/konnected/teams-collaboration/team-builder` is **Create team**. It creates a KonnectED collaboration team; it is not a second generic Team Builder product.

## 9. Kreative

```text
explore creative hub
→ create/incubate idea or work
→ collaborate in a creative space
→ submit/showcase output
→ creative domain state
```

The canonical navigation order follows creation → incubation → collaboration → showcase.

## 10. Team Builder

```text
select/create problem
→ define/select candidate people and constraints
→ create builder session
→ compose teams/members
→ problem/team state updates
```

Canonical navigation is `Sessions → Problems → People & Constraints`. Team Builder objects are Konnaxion objects; they are not Orgo Case/Task objects.

## 11. Insights

```text
open /reports
→ select Smart Vote / usage / performance / custom report
→ read cross-domain analytics
→ inspect/export where authorized
```

Insights is a read/analytics surface. It does not own the source domain state it aggregates, and it is not a child of KonTrol in the canonical suite switcher.

## 12. KonTrol

```text
admin enters KonTrol
→ authorization
→ operations or governance surface
→ moderation/users/roles/audit/Konsensus rules
→ underlying Konnaxion owner service
→ result
```

KonTrol is an administrative UI, not a replacement owner for every domain it displays. `/konsensus/admin` should resolve to the canonical `/kontrol/konsensus` configuration surface rather than create a second owner.

## 13. External system workflows

No concrete IK-conformant Orgo/Kristal/SemantiK Architect workflow is established as qualified by the current Konnaxion documentation snapshot. Target Konnaxion↔Orgo contracts use `governance.decision.execute/1.0.0` and `accountability.impact.publish/1.0.0`; the UI/backend must call an explicit adapter and preserve each system's ownership boundaries.

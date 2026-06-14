# OGCR — Open Modelling Questions

This app doubles as an **executable model of the OGCR domain**: building each screen
forces the abstract spec to become concrete, and that's where underspecified or
contradictory parts of the model show up. This file is the running log of those
findings.

Each entry records:

- **The question** — what the spec leaves open or contradictory.
- **What the app does for now** — the pragmatic choice we made to keep moving.
- **Registry / OBP implication** — what would need to change upstream to do it
  properly (feeds the registry design and the OBP enhancements backlog).

When a question is resolved, move it to **Resolved** at the bottom with the decision.

---

## 1. Operator ↔ user identity

**Question.** How does a logged-in user prove they are (or act for) an operator?
The `operator` entity has `email` but **no `user_id`** linking it to an OBP user.
There is no modelled relationship between an authenticated user and the operator
party they represent.

**What the app does for now.** The "List Activity" ownership gate matches the
logged-in user's email against `operator.email` (case-insensitive). An operator is
"yours" when its email equals your login email.

**Registry / OBP implication.** Email is a weak identity key — it changes, isn't
guaranteed unique, and doesn't express "user X may act for operators A and B."
The registry needs a real operator↔user link.

**Decision (2026-06-14) — implemented.** Created a dynamic entity
`user_operator_relationship` (singular, snake_case per convention) as a
many-to-many junction. As built, the fields are deliberately minimal:

- `user_operator_relationship_id` — PK (generated).
- `user_id` — the OBP user.
- `operator_id` — the operator.
- `relationship` — **free text**; direction fixed as **user → operator** (user =
  subject, operator = object), and this convention is written into the entity's
  own description. Example value: `"Owner"` (or `"Managing Director, Employee,
  Accountant"`).

Notably there is **no `status` or audit field**, so for now "revoke" = delete the
record, and `relationship` is unconstrained free text (no enum). If lifecycle/audit
matters later, add `status` + `granted_*` fields or a separate
`user_operator_relationship_verification` entity (mirroring the OGCR verification
pattern).

App wiring (done): constant `ENTITY_USER_OPERATOR_RELATIONSHIP`;
`getOperatorsForUserId(accessToken, userId)` resolves operators by `user_id`;
`linkUserToOperator(...)` creates a record; `/operators` (list) and
`/operators/create` (create + link) pages. The older email-matching
(`getOperatorsForUser`) still backs the `/activities/list` flow and can be retired
once everything reads through the relationship entity.

## 2. "Group of operators" vs a single `operator_id`

**Question.** The activity definition says an activity may be *"carried out by an
operator, or a group of operators."* But the `activity` schema has a single scalar
`operator_id`. The data model supports exactly one operator per activity, which
contradicts the prose.

**What the app does for now.** Treats activity→operator as 1:1 (one `operator_id`
per activity). Group activities are not representable.

**Registry / OBP implication.** If groups of operators are real, the model needs a
join (e.g. an `activity_operator` entity, possibly with a role like lead/member),
and every operator-scoped check (ownership, listing, payouts) must follow it rather
than reading a single field.

## 3. Registry-truth vs marketplace-truth fields

**Question.** Who is the authority for each field on a listing? The registry owns
the activity's facts (type, methodologies, location, dates). But commercial terms
(price per credit, credits available) and marketing presentation are the
marketplace's concern — and `price_per_credit` / `credits_available` don't exist in
the registry `activity` schema at all.

**What the app does for now.** Listings are **marketplace-owned data stored in the
app's own store (Redis)**, keyed by `activity_id`. The registry activity record is
never mutated by listing; registry fields are shown read-only. Marketing fields that
do exist on the registry (summary, image, media_links, website) are overlaid by the
listing when set.

**Registry / OBP implication.** This is the "who's the boss of this number?" split
from the design docs. The clean long-term mechanism is per-field write/read
permissions on a shared Dynamic Entity record (already on the OBP roadmap), so
marketplace-owned and registry-owned fields can coexist on one record with
different authorities — rather than living in a separate store.

## 4. Queryable Dynamic Entity GET (filtering)

**Question.** Can a DE list be filtered server-side (e.g.
`GET /activity?operator_id=op_…`)? The marketplace grid and the listing flow both
need to scope by operator, and at scale the grid needs filter/sort/paginate.

**What the app does for now.** Fetches the full entity list and filters in memory.
Fine at demo scale. (Note: `/activities/[id]` already passes `?activity_id=` filters
to verification entities — whether those are actually honoured server-side or
silently ignored is **unverified**.)

**Registry / OBP implication.** "Queryable DE GET" (field filter/sort/paginate) is a
known needed OBP enhancement. Until it exists, every consumer pays a full-scan +
in-memory filter cost and can't paginate.

---

## Resolved

_(none yet)_

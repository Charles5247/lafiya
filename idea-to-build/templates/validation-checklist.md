# Validation Checklist

> Run this checklist at these points:
>
> 1. **After Phase 2 + Phase 2.5** (Architecture + Design complete) — before generating any build prompts
> 2. **After Phase 3** (Build Prompts complete) — before handing off for execution
> 3. **After any Phase 6 change** that touches a shared contract (a collection, endpoint, or component used by more than one feature) — scope to the affected sections only, not the whole checklist
>
> Every item must pass before proceeding. Document failures in the Validation Report at the bottom.

---

## Phase 2 + 2.5 Validation: Architecture & Design Consistency

### Data Models ↔ API Endpoints

- [ ] Every collection referenced in `api-endpoints.md` exists in `data-models.md`
- [ ] Every field written to by an API endpoint exists in the corresponding collection definition
- [ ] Every field type in `api-endpoints.md` matches the type in `data-models.md`
- [ ] Every index needed by API queries is defined in `data-models.md`
- [ ] Security rules in `data-models.md` align with auth requirements in `api-endpoints.md`

### API Endpoints ↔ Page Specs

- [ ] Every endpoint called by a page in `page-specs.md` exists in `api-endpoints.md`
- [ ] Request parameters in `page-specs.md` match what `api-endpoints.md` expects
- [ ] Response fields used by pages exist in the endpoint's response definition
- [ ] Error codes handled in `page-specs.md` match those defined in `api-endpoints.md`

### Page Specs ↔ User Flows

- [ ] Every page referenced in `user-flows.md` exists in `page-specs.md`
- [ ] Page routes in `user-flows.md` match routes in `page-specs.md` exactly
- [ ] Navigation described in `user-flows.md` matches the "Navigation" section in `page-specs.md`
- [ ] Error paths in `user-flows.md` match error states in `page-specs.md`

### Auth & Security ↔ Everything

- [ ] Every endpoint in `api-endpoints.md` has auth requirements defined (public/authenticated/admin)
- [ ] Every protected route in `page-specs.md` is listed in `auth-security.md`
- [ ] Rate limits in `auth-security.md` match rate limits in `api-endpoints.md`
- [ ] Role requirements in `api-endpoints.md` match roles in `auth-security.md`
- [ ] Data isolation rules apply to every endpoint that accesses user-owned data

### Design System ↔ Page Specs (Phase 2.5)

- [ ] Every component type referenced in `page-specs.md` is defined in `design.md`
- [ ] Status colors used in `page-specs.md` match semantic color tokens in `design.md`
- [ ] Loading state descriptions reference skeleton/shimmer patterns from `design.md`
- [ ] Every page in `page-specs.md` has a corresponding mockup in `docs/design/mockups/`
- [ ] Every design token in `design.md` has an actual value — no `[ADJUST]` placeholders remain

### Notification & Analytics Architecture

- [ ] Every notification trigger described in the PRD has a corresponding backend spec in `api-endpoints.md` or `data-models.md`
- [ ] Every analytics event described in the PRD has a named event in `api-endpoints.md` or the PRD's AI Systems section
- [ ] Crash reporting provider is chosen and noted in the PRD's Tech Stack section

### Naming Consistency

- [ ] Collection names are spelled identically across ALL documents (e.g., `transactions` not `transaction` or `Transactions`)
- [ ] Endpoint paths are spelled identically across all documents
- [ ] Page names are spelled identically across all documents
- [ ] Field names are spelled identically across all documents
- [ ] Role names are spelled identically across all documents
- [ ] No typos, no pluralization inconsistencies, no camelCase/snake_case mismatches

---

## Phase 3 Validation: Build Prompt Completeness

### Feature Coverage — 12-Phase Checklist

For every MVP feature in the PRD, verify it has at least one prompt in each applicable phase:

- [ ] **Phase 1 (Scaffolding):** folder structure + SDK config for this feature's dependencies
- [ ] **Phase 2 (Database):** collection definition, security rules, indexes (if feature uses stored data)
- [ ] **Phase 3 (Auth):** auth flow or route guard (if feature requires authentication)
- [ ] **Slice file — Backend section:** API endpoint, service, Cloud Function defined for this feature (if feature has backend logic). Firestore security rules extended to cover this feature's collections.
- [ ] **Slice file — Frontend section:** data-fetching hook, state provider, cache invalidation defined for this feature (if feature has client state)
- [ ] **Slice file — UI Components section:** reusable component(s) defined for this feature (if feature introduces shared UI)
- [ ] **Slice file — Pages section:** every screen in this feature fully specified, with all 4 states — loading, empty, error, success
- [ ] **Slice file — Integration section:** navigation wiring, real-time listener, analytics event for this feature (if applicable)
- [ ] **Phase 9 (Security):** auth middleware, rate limit, input sanitization (for every endpoint)
- [ ] **Phase 10 (Error Handling):** graceful failure for every networked operation
- [ ] **Phase 11 (Testing):** unit tests, component tests, integration test for key flows
- [ ] **Phase 12 (Deployment):** CI/CD, monitoring, crash reporting (covered once globally)

P2 features are NOT included in build prompts unless the user explicitly opted for all-at-once.

### Prompt Format Quality

- [ ] Every prompt follows the 4-section structure: Specification Paragraphs → Instructions → Verification → Honest Advice
- [ ] Every prompt title is a descriptive sentence using an approved format from `prompt-writing-rules.md` Rule 7
- [ ] Every prompt has a `[N]` sequential number in brackets — no gaps in the sequence
- [ ] No prompt leaves decisions to the executing agent ("use an appropriate library" is not acceptable)
- [ ] All instructions are in plain English with exact names from architecture docs
- [ ] Specification paragraphs contain no code and no file paths — behavior only

### Reference Chain

- [ ] No prompt references a collection, endpoint, component, or page that hasn't been created in an earlier prompt
- [ ] Prior work is cross-referenced by exact `[N]` number AND short artifact description
- [ ] Stack-conditional sections (`**If Next.js:**`, `**If Flutter:**`) present where behavior differs between stacks

### UI Prompt Completeness (Phases 6 and 7)

- [ ] Every Phase 6 (UI Component) prompt has a `**Design reference:**` field linking to the mockup from Phase 2.5
- [ ] Every Phase 7 (Pages) prompt has a `**Design reference:**` field linking to the mockup from Phase 2.5
- [ ] Every Phase 7 prompt explicitly specifies: loading state, empty state, error state, success state
- [ ] Every Phase 6 and 7 prompt includes accessibility requirements: ARIA labels, keyboard navigation, focus management, contrast ratios

### Security Coverage

- [ ] Every API prompt includes: auth token validation with exact 401 response body
- [ ] Every API prompt includes: rate limit specification with exact 429 response body and `Retry-After` header
- [ ] Every API prompt includes: input validation rules (type, length, format, allowed values)
- [ ] Every API prompt includes: data isolation (userId check — never from request params, always from auth context)
- [ ] Every UI prompt specifies what happens when auth fails (exact redirect, exact message)
- [ ] No field that must be server-generated (createdAt, userId, role) is writable from client code

### Error Handling Coverage

- [ ] Every API prompt specifies error responses for: 400 (bad input), 401 (no auth), 403 (forbidden), 404 (not found), 429 (rate limited), 500 (server error)
- [ ] Every UI prompt specifies all 4 states: loading, empty, error, success — with exact copy for each
- [ ] Error messages in every prompt are user-friendly — no raw error codes, no technical stack traces
- [ ] Every error state has a recovery action: retry button, clear filters, contact support link

### Notification & Analytics Coverage

- [ ] Every notification trigger described in the PRD has a Backend section prompt in the relevant slice file
- [ ] Every analytics event described in the PRD has an Integration section prompt in the relevant slice file
- [ ] Crash reporting integration is covered in Phase 12

### Testing Coverage

- [ ] Unit tests cover all services and repositories from each feature's slice file (Backend section)
- [ ] Unit tests cover all state hooks/providers from each feature's slice file (Frontend section)
- [ ] Component tests cover all reusable UI components from each feature's slice file (UI Components section)
- [ ] Integration tests cover all critical user flows from `user-flows.md`
- [ ] API tests cover: auth, validation, rate limits, data isolation, happy path
- [ ] Security rule tests verify every blocked operation (read-other-user, write-wrong-userId, update-immutable-field)
- [ ] Accessibility tests (automated) run against all Pages section screens across all slice files

### Honest Advice Quality

- [ ] Every prompt's honest advice section has 1–2 questions (never 0, never more than 2)
- [ ] Questions are specific to the risk of THIS step — not generic ("what could go wrong?")

---

## Proof Classification (run after Structural Checks pass)

A passing structural checklist proves the documents agree with each other. It does not prove the plan is buildable or correct. Classify readiness into exactly one of these four buckets — every item, not just the failures:

- [ ] **Verified by document cross-reference** — confirmed mechanically against another document (this is what the checklist above proves)
- [ ] **Verified by explicit reasoning** — a reasoning-mode-shift question (write-rate check, threat trace, back-button behavior, necessity test, etc.) was answered with a specific, non-generic answer in the relevant doc
- [ ] **Flagged, not resolved** — a real risk surfaced by an escalation criterion or reasoning-mode-shift check, documented but not yet fixed
- [ ] **Unverified** — can't be confirmed by inspection alone (a library's claimed feature support, a third-party API's actual behavior) — name it, don't let it pass silently

---

## Cold-Reader Gate

Run after Structural Checks and Proof Classification both pass, before generating build prompts (Phase 3) or handing off for execution (Phase 5).

Give a fresh context — a new chat with no prior history of this project — only the finished documents: `concept-brief.md`, `PRD.md`, everything in `docs/architecture/`, and `docs/design/`. Ask it, without any other context:

- [ ] What build order would you follow? (Compare against PRD Section 5's dependency map — they must match.)
- [ ] What would you need answered before you could start on prompt `[1]`? (Every answer here is a documentation gap — fix the doc, don't answer it in the chat and move on.)
- [ ] Any contradiction between two documents?

**Exit criteria:** zero blocking questions, and the cold reader's derived build order matches the dependency map. A correct guess from the cold reader still means the documents never stated the answer — treat it as a gap and fix it.

---

## Validation Report Template

```
## Validation Report

**Date:** [date]
**Phase:** [2/2.5, 3, or 6]
**Validator:** [who ran this — "generated by planning agent", "reviewed by user", etc.]

### Summary
- Total items checked: [N]
- Passed: [N]
- Failed: [N]
- Warnings: [N]

### Proof Classification
- Verified by document cross-reference: [N]
- Verified by explicit reasoning: [N]
- Flagged, not resolved: [N] — [list each one]
- Unverified: [N] — [list each one and why]

### Cold-Reader Gate
- Blocking questions raised: [N] — [list, or "none"]
- Derived build order matched dependency map: [Y/N]

### Failures (must fix before proceeding)
1. [Specific failure — e.g., "api-endpoints.md references 'bankStatements' collection but data-models.md calls it 'bank_statements'"]
2. [Specific failure]

### Warnings (should fix, not blocking)
1. [Non-critical issue — e.g., "No rate limit specified for GET /api/health endpoint"]

### Fixes Applied
1. [What was fixed and in which file — e.g., "Renamed 'bank_statements' to 'bankStatements' in data-models.md for consistency across all documents"]

### Result: ☐ PASS — proceed to next phase | ☐ FAIL — fix issues and re-validate
```

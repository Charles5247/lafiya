# Phase Order Reference

> Defines the sequencing rules for build prompts. The standard 12-phase order below works for most web and mobile projects. Adapt per project based on the feature dependency map in the PRD.

---

## Standard 12-Phase Order (Web / Mobile Apps)

| #   | Phase File                | What It Covers                                                                                                                                                                                                                                        | Dependencies                                                |
| --- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | `01-scaffolding.md`       | Project init, folder structure, ALL dependencies, SDK config, env files, base theme, navigation shell, constants, error types, seed scripts, asset generation                                                                                         | None — always first                                         |
| 1.5 | `01.5-test-infra.md`      | Test runner setup, fake service clients, and test utility helpers. No feature code — infrastructure only. Enables all Phase 2–10 verification steps to be executable.                                                                              | Phase 1 (project exists, SDK configured)                    |
| 2   | `02-database.md`          | Foundation collections only: `users`, `sessions`, and any truly cross-cutting collections not owned by a single feature. Security rules for these foundation collections. Indexes.                                                                     | Phase 1 (SDK configured)                                    |
| 3   | `03-auth.md`              | Sign up, sign in, sign out, stay signed in. User document creation on first sign-up. Auth state provider. Route guard. Every SSO provider in the PRD. Every auth error code → human-readable message. No raw error codes ever shown to users          | Phase 2 (users collection exists)                           |
| 4–8 | `slice-f<N>-<name>.md`    | One file per MVP feature. Each file covers in order: feature data models + security rules extension, backend (endpoints → services → Cloud Functions), frontend (hooks/providers), UI components, pages (all 4 states), integration (routing, real-time, analytics). Slice files generated in PRD Section 5 dependency order — each slice complete and tested before the next dependent slice begins. | Phase 3 (auth established) + all prior slices it depends on |
| 9   | `09-security.md`          | Auth middleware on every endpoint, rate limiting, data isolation per user, input sanitization, field-level write rules, secrets audit, API key rotation                                                                                               | All feature slices complete (all endpoints exist)           |
| 10  | `10-error-handling.md`    | Graceful failure for every networked operation, user-facing messages (no raw error codes ever), retry logic, fallback UI, offline behavior                                                                                                            | All feature slices complete (UI and wiring exist)           |
| 11  | `11-testing.md`           | Test infrastructure first (helpers, mocks, fake implementations), unit tests per service, component/widget tests per critical screen, integration tests for key flows, security rule tests, accessibility tests, coverage enforcement                 | All prior phases                                            |
| 12  | `12-deployment.md`        | CI pipeline, CD pipeline, platform-specific release config, environment/flavor setup, crash reporting integration, analytics verification, bundle analysis, CDN config, image optimization, app store submission requirements, launch checklist       | Phase 11 validated                                          |

---

## Within-Phase Ordering Rules

### Phase 1 — Scaffolding

Order by dependency:

1. Project init and package manager setup
2. All dependency installation (run once — list every package)
3. Environment variable files (`.env.local`, `.env.example`, all flavors)
4. SDK initialization (Firebase, Supabase, or custom backend client)
5. Base theme and design token files (CSS variables, theme extensions)
6. Navigation shell (routing config, app entry point, bottom nav / sidebar skeleton)
7. Shared constants (`lib/constants/`, `core/constants/`)
8. Shared error types (`lib/errors/`, `core/errors/`)
9. Seed scripts and asset generation (if applicable)

**If Flutter:** Create `pubspec.yaml` with all packages declared before any Dart files.
**If Next.js:** Create `package.json` with all dependencies declared, run `npm install`, then set up `app/layout.tsx` before any feature folders.

### Phase 1.5 — Test Infrastructure

> This phase exists so that every verification section in Phases 2–10 is executable from the
> moment it is written. The test runner and fake service clients must exist before any feature
> code is written — not in Phase 11 when all the code is already built.

Order:

1. **Test runner installation and configuration** — Install and configure `vitest` (Next.js /
   React Native) or confirm `flutter_test` is configured (Flutter). Create the test script
   entry in `package.json` / `pubspec.yaml`. A passing empty test suite is the deliverable.

2. **Fake service client** — Create a fake/stub implementation of the primary backend service
   (Firebase, Supabase, or custom API client) that returns controlled, in-memory data. This
   fake is used by all unit and integration tests in Phases 2–10 so no test ever hits a real
   network or real database.

3. **Test utilities and factory helpers** — Create helper functions for building test fixtures:
   fake user objects and fake entity objects matching the data models in
   `docs/architecture/data-models.md`. One factory function per major data model.

**Deliverable:** Running `npm test` (or `flutter test`) from the project root executes the
empty suite and returns zero failures. All Phase 2–10 verification sections that reference
test commands assume this infrastructure exists.

**Prompt count:** 3–5 prompts. Keep it lean — this phase is infrastructure, not features.

### Phase 2 — Database

Order by data dependency:

1. User-related collections first (`users`, `sessions`, `profiles`)
2. Core entity collections (the main entities the app manages)
3. Junction/relationship collections (many-to-many joins)
4. Supporting collections (`notifications`, `audit_logs`, `feature_flags`)
5. Security rules for the foundation layer only (`users`, `sessions` collections — one prompt
   covering these cross-cutting collections). Feature-specific security rules are extended once
   per feature slice: see the Per-Feature Vertical Slices section below.
6. Composite indexes (one prompt per feature's indexes)
7. Seed data (one prompt per collection that needs initial data)

Each collection prompt includes the serialization round-trip unit test.

### Phase 3 — Auth

Order by user flow:

1. Sign-up flow (registration, email verification)
2. Sign-in flow (email/password, plus any SSO providers from PRD)
3. Sign-out and session management
4. Password reset / forgot password
5. Auth state provider and route guard
6. User document creation Cloud Function (fires on `auth.user().onCreate`)
7. Auth error mapping (every Firebase/Supabase error code → human-readable message)

### Per-Feature Vertical Slices

> This section replaces the standard Phases 4–8 (Backend Features, Frontend Features, UI
> Components, Pages, Integration). Each feature from PRD Section 4 gets one slice file named
> `slice-f<N>-<feature-name-kebab>.md`, generated in the dependency order from PRD Section 5.
> A feature's slice is complete and its tests pass before the next dependent feature's slice
> begins.

Within each slice file, generate sections in this order:

1. **Feature data models** — Collections and fields owned by this feature (not in `02-database.md`).
   Include Firestore security rules for this feature's collections by rewriting the full current
   rules file — not a partial patch. The rules file is always complete and valid after this step.

2. **Backend** — API endpoints and services for this feature. Order: contract (endpoint definition)
   before implementation (service). Within endpoints: CRUD first, then action endpoints, then
   export endpoints. Cloud Functions and notification backend last.

3. **Frontend** — Data-fetching hooks and state providers for this feature. Match the contract
   established in the Backend section. Include cache invalidation strategy.

4. **UI Components** — Reusable components introduced by this feature (skip if none). Order:
   atomic → molecular → organism → feature-specific.

5. **Pages** — Every screen in this feature. Each page prompt specifies all four states:
   loading, empty, error, success. No page is "basically the same as X" — every page gets
   its own prompt.

6. **Integration** — Navigation wiring for this feature's routes, real-time listener setup
   (if applicable), analytics event instrumentation for this feature's user actions.

**Conditional notes:**

- **If Flutter (Riverpod):** Frontend section uses `AsyncNotifierProvider`. Use `ref.invalidate()`
  for cache invalidation. UI section uses `ConsumerWidget`. Pages use `GoRouter` routes.
- **If Next.js (TanStack Query):** Frontend section uses `useQuery`/`useMutation`. Pages are
  Server Components by default; add `"use client"` only when the page requires browser APIs
  or hooks. Use `loading.tsx` for streaming skeleton states.
- **If React Native (Zustand + TanStack Query):** Use Zustand for UI state, TanStack Query for
  server state. Every screen exported from the screens barrel. Use `useNavigation` hook.
- **Real-time requirement within a feature:** Add a “Real-time” subsection inside the
  Integration section — server-side listener in Backend, client-side connection in Frontend,
  teardown in Integration. No separate phase.

### Phase 9 — Security

Order by criticality:

1. Auth middleware verification (every endpoint validates session)
2. Rate limiting (per-IP and per-user limits on all endpoints)
3. Input sanitization (every endpoint validates and sanitizes input)
4. Data isolation audit (every query verifies userId matches auth.uid)
5. Field-level write rules (fields that must never be writable from client)
6. Secrets audit (verify no API keys in client code, all in env vars)
7. API key rotation procedures (documented process, not code)

### Phase 10 — Error Handling

Order by user-facing impact (highest visibility first):

1. Network failure handling (offline detection, retry logic)
2. Auth failure handling (session expiry → redirect, token refresh)
3. Feature-specific error states (one prompt per feature area)
4. Rate limit error handling (user-friendly backoff messaging)
5. Fallback UI for complete failures (generic error page with recovery CTA)
6. Error logging and monitoring (log errors to crash reporter without PII)

### Phase 11 — Testing

Order by foundation → unit → integration → E2E:

1. Test infrastructure (helpers, mocks, fake Firebase/Supabase implementations)
2. Unit tests per service (one prompt per service from Phase 4)
3. Unit tests per frontend feature (one prompt per hook/provider from Phase 5)
4. Component/widget tests per critical screen
5. Integration tests for key user flows (from `user-flows.md`)
6. API endpoint tests (one prompt per endpoint group from Phase 4)
7. Security rule tests (one prompt — tests every blocked operation)
8. Accessibility tests (automated axe/a11y audit per screen)
9. Coverage threshold enforcement (fail CI if below threshold)

### Phase 12 — Deployment

Order by infrastructure → config → verification → launch:

1. CI pipeline (lint, type-check, unit tests on every PR)
2. CD pipeline (auto-deploy to staging on merge to main, manual promote to prod)
3. Environment/flavor configuration (dev, staging, production — separate Firebase projects)
4. Crash reporting integration (Sentry or Firebase Crashlytics with source maps)
5. Analytics verification (verify events arrive in production dashboard)
6. Bundle analysis and performance audit (web: Lighthouse ≥90, mobile: build size report)
7. CDN and image optimization config (Next.js Image, Firebase Hosting cache headers)
8. App store submission config (iOS: App Store Connect, Android: Play Console, Expo EAS for RN)
9. Launch checklist (final pre-launch verification pass)

---

## Extended Phase Order: AI Agent Systems

Use this order for projects with LLM agents, multi-agent orchestration, or autonomous task execution. The agent system must be provably working in a terminal/test harness before any UI code is written.

> **Relationship to standard track:** This track replaces the Per-Feature Vertical Slices section
> (what was Phases 4–8 in the old horizontal model). Phases 1–3 (Scaffolding, Test Infra,
> Database, Auth) and the closing sweeps (Security, Error Handling, Testing, Deployment) follow
> the standard track. The agent system itself is a specialized vertical sequence that replaces
> per-feature slices for the AI subsystem.
>
> **Before Phase 4 begins:** `docs/architecture/agent-system.md` must be complete — every agent
> in Section 3, the Edge Case Matrix in Section 4, and the Failure Mode Table in Section 5 fully
> filled in, not left with placeholder text. Phases 4–7 below are generated *from* that document;
> an incomplete `agent-system.md` produces vague, ambiguous prompts the same way a skipped
> `data-models.md` would for a standard feature slice.

| #     | Phase File                | What It Covers                                                                                                                                |
| ----- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–3   | Standard                  | Scaffolding, Database, Auth (as above)                                                                                                        |
| 4     | `04-agent-tools.md`       | Every external tool the agents can call (web search, calculator, API client). Each tool: input schema, output schema, error handling, timeout |
| 5     | `05-agent-base.md`        | Base agent class with standard interface: `invoke()`, `get_confidence()`, `format_output()` — matches the Inter-Agent Contract in `agent-system.md` Section 2 |
| 6     | `06-individual-agents.md` | Each agent implementation — one prompt per agent, generated directly from that agent's block in `agent-system.md` Section 3                    |
| 7     | `07-orchestrator.md`      | Orchestrator / voting or synthesis logic — generated directly from `agent-system.md` Section 4's Edge Case Matrix. Every row must be implemented, not just the happy path |
| 7.5   | `07.5-agent-harness.md`   | The test harness defined in `agent-system.md` Section 7 — one fixture per Edge Case Matrix and Failure Mode Table row. This is the gate: do not proceed to Phase 8 until every fixture passes with the documented expected behavior |
| 8     | `08-backend-api.md`       | Backend API exposing the agent system to clients                                                                                              |
| 9     | `09-frontend-features.md` | State hooks/providers for agent system (same as standard Phase 5)                                                                             |
| 10    | `10-ui-components.md`     | Agent-specific UI components (vote displays, confidence bars, agent status)                                                                   |
| 11    | `11-pages.md`             | Dashboard pages                                                                                                                               |
| 12    | `12-integration.md`       | Navigation, real-time agent output streaming, analytics                                                                                       |
| 13–16 | Standard (renumbered)     | Security, Error Handling, Testing, Deployment                                                                                                 |

**Critical rules:**

- Never write orchestrator code before all individual agents are tested in isolation
- Never build the UI before the agent system produces correct output in a terminal/test harness — Phase 7.5 is that proof, not Phase 7 itself
- Never go to live execution before paper/simulation mode is fully validated
- Never treat a Phase 7 orchestrator as done because it handles the happy path — every row of `agent-system.md`'s Edge Case Matrix needs a passing fixture before Phase 8 begins

---

## Extended Phase Order: Real-Time Trading Systems

> **Relationship to standard track:** This track replaces the Per-Feature Vertical Slices section
> (what was Phases 4–8 in the old horizontal model). Phases 1–3 and the closing sweeps follow
> the standard track (renumbered). The trading system itself is a specialized vertical sequence.
> Phase 21 (live execution) must never be generated until paper mode has been validated — this
> constraint is sequencing-based, not number-based, and survives any renumbering.
>
> **Before Phase 6 begins:** `docs/architecture/agent-system.md` must be complete for the trading
> agent roster — same requirement as the general AI Agent track. The Risk Agent's override
> authority (Phase 8) and the voting orchestrator's quorum rules (Phase 9) must both be fully
> specified in Section 4's Edge Case Matrix before those phases are generated.

| #     | Phase File                  | What It Covers                                                                                       |
| ----- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1–3   | Standard                    | Scaffolding, Database, Auth                                                                          |
| 4     | `04-market-data.md`         | WebSocket feed manager, OHLCV ingestion, feed health monitoring, stale-data detection                |
| 5     | `05-paper-engine.md`        | Paper trading engine: simulated order fills, position tracking, P&L calculation, slippage simulation |
| 6     | `06-agent-base.md`          | Base agent class with standard interface — matches `agent-system.md` Section 2's Inter-Agent Contract |
| 7     | `07-individual-agents.md`   | Each trading agent — one prompt per agent, generated from its block in `agent-system.md` Section 3   |
| 8     | `08-risk-agent.md`          | Risk Agent with circuit breaker authority — separate process, override capability                    |
| 9     | `09-voting-orchestrator.md` | Council voting mechanism, quorum rules, trade proposal lifecycle — generated from `agent-system.md` Section 4's Edge Case Matrix |
| 9.5   | `09.5-agent-harness.md`     | The test harness from `agent-system.md` Section 7 — one fixture per Edge Case Matrix and Failure Mode Table row, run in paper mode. Gate: do not proceed to Phase 10 until every fixture passes |
| 10    | `10-execution-agent.md`     | Order placement, modification, cancellation — paper mode only initially                              |
| 11    | `11-backend-api.md`         | Backend API for dashboard and Telegram bot                                                           |
| 12    | `12-telegram-bot.md`        | Trade alerts, daily summaries, conversational interface                                              |
| 13    | `13-frontend-features.md`   | Real-time state, WebSocket listeners, chart data providers                                           |
| 14    | `14-ui-components.md`       | Dashboard UI components (charts, position cards, agent activity)                                     |
| 15    | `15-pages.md`               | Dashboard pages                                                                                      |
| 16    | `16-integration.md`         | Full system wiring, analytics                                                                        |
| 17–20 | Standard (renumbered)       | Security, Error Handling, Testing, Deployment                                                        |
| 21    | `21-live-execution.md`      | Switch from paper to live — ONLY after paper mode validated for minimum 4 weeks                      |

**Critical rules:**

- Phase 21 (live execution) must never be generated until paper mode has been validated
- Risk Agent (Phase 8) must be tested as a separate process with genuine override capability before any execution code is written
- The paper engine (Phase 5) must accurately simulate slippage, partial fills, and rejected orders — not just ideal fills
- Phase 9.5's harness must run in paper mode, not mocked agents — the 4-week validation window in Phase 21 is measuring the same system the harness proved, not a simplified stand-in for it

---

## Adapting Order Per Project

| Project type | Adapt the slice model as follows |
| --- | --- |
| API-first (headless backend) | Foundation phases 1, 1.5, 2, 3. Per-feature slices contain Backend sections only — no Frontend, no UI Components, no Pages. Closing sweeps: Security (9), Error Handling (10), Testing (11), Deployment (12). |
| Frontend-only (external API) | Foundation phases 1 and 1.5 only (no Phase 2 database, no Phase 3 auth). Per-feature slices contain Frontend, UI Components, Pages, and Integration sections only — no Backend section. Closing sweeps as normal. |
| Web + Mobile (shared backend) | Generate Foundation and each feature's Backend section once. Then generate per-feature Frontend + UI Components + Pages sections separately for each platform. Closing sweeps run per-platform for Testing and Deployment. |
| Real-time requirement (any feature) | No separate phase. Add a “Real-time” subsection inside that feature's slice — server-side listener in the Backend section, client-side connection in the Frontend section, teardown in the Integration section. |
| AI/ML features | Use the Extended AI Agent Phase Order instead of per-feature slices for the agent subsystem. Non-agent features follow the standard per-feature slice model. |

---

## Prompt Density Guide

| Phase                 | Typical Prompt Count | Rule of Thumb                                                        |
| --------------------- | -------------------- | -------------------------------------------------------------------- |
| 1 — Scaffolding         | 8–20   | 1 per feature area + 1 for SDK config + 1 for theme                              |
| 1.5 — Test Infra       | 3–5    | Test runner + fake service client + factory helpers — no feature tests            |
| 2 — Database            | 3–6    | Foundation collections only (users, sessions) + rules + indexes                  |
| 3 — Auth               | 5–10   | 1 per auth flow (sign-up, sign-in, SSO provider, reset, guard)                   |
| Slice — per feature     | 10–30  | Backend + Frontend + UI + Pages + Integration for one feature. Multiply by feature count. |
| 9 — Security            | 5–10   | 1 per security concern                                                            |
| 10 — Error Handling     | 8–20   | 1 per feature area                                                                |
| 11 — Testing            | 15–35  | 1 per service + 1 per critical screen + 1 per integration flow                   |
| 12 — Deployment         | 6–10   | 1 per deployment concern                                                          |

**Total range:**

- Simple app: ~120–180 prompts
- Standard app: ~200–350 prompts
- Complex app: ~350–500 prompts
- AI agent system: ~400–600 prompts
- Trading system: ~500–700 prompts

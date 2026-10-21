# Agent System Design

> This document defines the complete multi-agent system: every agent, the contract between them, how they're orchestrated, what happens when something fails, what it costs, and how it's proven correct before any UI is built. Only complete this document if the project has AI agents or LLM-driven autonomous components — otherwise skip it entirely.

---

## 0. System Classification & Worst-Case Ceiling

> Complete this section before filling in any other section. Section 4 (Orchestration) and
> Section 5 (Safety) must be traceable back to the answers here — an agent system with no
> named worst-case action has not actually been designed, just described.

### Autonomy Level

- **Level:** [Fully autonomous / Human-in-the-loop (approval required before action) / Human-on-the-loop (can act, human can intervene)]
- **Reasoning:** [Why this level — what makes a higher level unsafe, or a lower level unnecessarily slow]

### Worst-Case Autonomous Action

Name the single most damaging thing this system could do without a human noticing in time — not a hypothetical, the specific action given this product's actual agent roster and authority levels:

- **Worst-case action:** [e.g., "Execution Agent places a trade based on a hallucinated signal that all voting agents happened to agree on"]
- **What currently prevents it:** [Point to the specific safety constraint in Section 5 that stops this — if nothing does yet, that is the first gap to close]

### Human Checkpoints

| Checkpoint | Trigger | Human action required |
| ---------- | ------- | ---------------------- |
| [e.g., "First live-mode transition"] | [e.g., "Paper mode validation period complete"] | [e.g., "Explicit approval to flip LIVE_MODE flag — see Hard Stops in SKILL.md"] |
| [Add every point where the system pauses for a human] | | |

---

## 1. Agent Roster

| Agent Name | Role (one line) | Model | Authority | Reads | Produces |
| ---------- | ---------------- | ----- | --------- | ----- | -------- |
| [Agent 1] | [What it does] | [exact pinned version — see note below] | [Voter / Override / Executor / Advisory-only] | [Inputs] | [Outputs] |
| [Agent 2] | | | | | |

> **Pin exact model versions** (e.g., `claude-sonnet-4-5-20250929`), never a rolling alias — a
> provider deprecating an alias mid-project is a silent behavior change you won't see coming.
> Full specification for each agent lives in Section 3, not this table — this is an index only.

---

## 2. Inter-Agent Contract

> Define this once, here. Every individual agent in Section 3 must conform to it. This is what
> prevents Agent 3's output shape drifting from what Agent 7 expects to read — the same class
> of bug the Name Consistency check catches for collections and endpoints, applied to agents.

### Base Input Shape

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `task` | string | yes | Natural language instruction |
| `context` | object | yes | Arbitrary structured context — each agent's extension to this is documented in its Section 3 entry |
| `previous_outputs` | list of `AgentOutput` | no | Upstream outputs, if this agent reads other agents' work |
| `max_tokens` | int | no | Default: [value] |
| `session_id` | string | yes | Links this invocation to a session for logging |

### Base Output Shape

| Field | Type | Notes |
| ----- | ---- | ----- |
| `agent_name` | string | |
| `output` | string | Structured data serialized to JSON — per-agent schema defined in Section 3 |
| `confidence` | float 0.0–1.0 | Per-agent formula defined in Section 3 — never "the model decides" |
| `latency_ms` | int | LLM call time only, not input prep or output parsing |
| `tokens_used` | int | |
| `error` | string or null | `null` on success |
| `timestamp` | datetime (UTC) | |

### Logging

- Every invocation, success or failure, is persisted to [table/collection name].
- Logging is fire-and-forget — a logging failure never blocks or alters the returned output.

---

## 3. Individual Agent Specifications

> Repeat this block for every agent in the roster. This is the level of detail build prompts
> for Phase 6 (`06-individual-agents.md`) will be generated from — vague entries here produce
> vague prompts.

### Agent: [Name]

- **Role:** [One line]
- **Authority:** [Voter / Override / Executor / Advisory-only]
- **Model:** [exact pinned version]
- **Tools it can call:** [list, or "none — LLM reasoning only"]
- **Input contract:** [fields this agent expects inside the base `context` object, with types]
- **Output schema:** [structured fields this agent's `output` JSON contains, with types and constraints]
- **Confidence scoring:** [exact formula or rule — not "the model decides"]
- **Failure behavior:** [what this agent returns when it can't produce a valid answer — never leave this unspecified]
- **Est. cost per invocation:** [token estimate × model price]

[Repeat for each agent]

---

## 4. Orchestration & Voting Design

### Design

- **Pattern:** [LangGraph state machine / custom loop / voting council / weighted synthesis / hierarchical]
- **Quorum rule (if voting):** [e.g., "5 of 9 agents must vote YES"] — [n/a if not a voting pattern]
- **Minimum agents required to proceed at all:** [e.g., "at least 2 of 4 analytical agents must succeed, or the orchestrator returns an error state rather than a low-confidence guess"]
- **Escalation to human:** [What condition pauses the system and asks for confirmation before proceeding?]

### Edge Case Matrix

> Every row must have a filled-in expected behavior. "Handle gracefully" is not an answer —
> state exactly what the orchestrator does.

| Scenario | Expected behavior | Who/what decides |
| -------- | ------------------ | ------------------ |
| Full participation, clear majority/consensus | [fill in] | Orchestrator |
| Split vote / conflicting signals with no majority | [fill in] | |
| One or more agents abstain | [fill in — does abstention count toward the quorum denominator?] | |
| An agent times out mid-round | [fill in — does the round proceed without it, or fail entirely?] | |
| An agent returns malformed/unparseable output | [fill in — treated as abstain, as an error, or does it block the round?] | |
| An override-authority agent dissents | [fill in] | Override agent |
| Two override-authority agents disagree with each other | [fill in — this cannot be left undefined] | |
| Fewer agents respond than the stated minimum | [fill in — must match "Minimum agents required" above] | |

---

## 5. Safety Constraints & Failure Modes

### Safety Constraints

- [Constraint 1 — e.g., "No single agent can initiate an irreversible action without orchestrator approval"]
- [Constraint 2 — e.g., "Circuit breaker at [threshold]: [system response]"]
- [Add every constraint that prevents the Worst-Case Autonomous Action named in Section 0]

### Failure Mode Table

| Failure | Detection | System response |
| ------- | --------- | ----------------- |
| Individual agent's LLM call fails after retries | `invoke()` returns an error output | [fill in — excluded from quorum denominator? Round fails?] |
| Orchestrator process itself crashes mid-round | [fill in] | [fill in — resume from saved state, or discard and restart the round?] |
| LLM provider outage | [fill in] | [fill in — pause all agent activity, failover, or alert-only?] |
| An agent's structured output fails schema validation | [fill in] | [fill in] |
| Cost/token budget (Section 6) exceeded mid-run | [fill in] | [fill in — this must be a hard stop, not an alert-only response] |

---

## 6. Cost & Token Budget

- **Est. cost per full orchestration cycle:** [sum of per-agent estimates from Section 3]
- **Daily/monthly ceiling:** [amount]
- **Behavior at 80% of ceiling:** [alert only / throttle to essential agents only]
- **Behavior at 100% of ceiling:** [must be a hard stop — an alert with no accompanying stop is not a ceiling; see Hard Stops in SKILL.md]
- **Prompt caching applied to:** [which agents' system prompts are static enough to cache — most agent system prompts qualify]

---

## 7. Test Harness Specification

> The harness is the artifact that proves the agent system "produces correct output in a
> terminal/test harness" — the gate every Extended Track build (`phase-order.md`) requires
> before any UI phase begins. It is not optional and not implicit — define it here.

### What the harness is

- A runnable script — e.g. `harness/run_agents.py` — not a manual REPL walkthrough
- Takes a fixture file (JSON/YAML) of test scenarios as input
- Runs each scenario through the full pipeline: individual agents → orchestrator → final decision
- Produces a human-readable report: per-agent output, confidence, latency, and the orchestrator's final decision with reasoning

### Fixture scenarios required before the UI phase begins

1. Happy path — all agents succeed, clear consensus
2. One fixture per row of the Section 4 Edge Case Matrix — every edge case needs a corresponding scenario, not just the happy path
3. Adversarial input — malformed, empty, or contradictory source data per agent
4. Timeout simulation — one agent artificially delayed past its timeout
5. Cost ceiling — simulate hitting the Section 6 budget mid-run

### Exit criteria

The harness must run every fixture above and produce the behavior specified in Section 4 and Section 5 for each one — not just the happy path. Record actual harness output next to expected behavior (in this file or a linked `harness/results.md`) before marking the agent system "proven in isolation" and moving to Phase 9 (or the equivalent UI phase) of the Extended Track.

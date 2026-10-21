# Example: AI Agent System Prompts (Extended Track)

> Shows what prompts look like in the Extended AI Agent Phase Order from `resources/phase-order.md`. Uses a different fictional app: **Meridian** — a multi-agent market research platform. Stack: Python + FastAPI + PostgreSQL + Redis + Anthropic Claude API.
>
> These prompts come from the "Agent Infrastructure" phases (Phases 5–7 of the Extended AI Agent Track): the base agent class, one individual agent, and the orchestrator that synthesizes all analytical agents' output — including disagreement detection, override authority, and partial-failure handling. The agent system must be fully proven in isolation (see `templates/architecture/agent-system.md` Section 7, Test Harness Specification) before any frontend work begins.

---

## [ ] [28] We're building the BaseAgent class for Meridian — the abstract class all specialized agents inherit from, establishing a standard interface for invocation, logging, retry logic, and confidence scoring.

**Why a base class —** Meridian has 5 specialized agents (Sentiment, Competitive, Regulatory, Technical, Summary). Without a base class, each agent reinvents retry logic, output formatting, latency measurement, and database logging differently. The base class enforces a contract: every agent has `invoke()`, `get_confidence()`, and is logged to the database after every invocation, regardless of success or failure.

**`AgentInput` shape —** A Pydantic dataclass with: `task` (str — the natural language instruction), `context` (dict — arbitrary structured context the caller provides, e.g. source documents, prior outputs), `previous_outputs` (list[AgentOutput] — outputs from upstream agents in a pipeline), `max_tokens` (int, default 4096), `session_id` (str — links this invocation to a user session for logging).

**`AgentOutput` shape —** A Pydantic dataclass with: `agent_name` (str), `output` (str — the agent's result), `confidence` (float 0.0–1.0), `latency_ms` (int), `tokens_used` (int), `error` (str | None — None on success, error message on failure), `timestamp` (datetime, UTC). The output is always a string — specialized agents produce structured data and serialize it to JSON before setting this field.

**Retry logic —** `BaseAgent.invoke()` attempts the LLM call up to 3 times. On `anthropic.APIStatusError` (rate limit, overload): wait using exponential backoff (2^attempt seconds, max 30 seconds). On `anthropic.APIConnectionError`: wait 5 seconds then retry. On `anthropic.BadRequestError` (invalid input — model refuses): do NOT retry — return immediately with `error` field set. Any unhandled exception returns an output with `error` set rather than raising — the caller always receives an `AgentOutput`.

**Timing —** `latency_ms` measures only the LLM API call time — not input preparation or output parsing. Record `time.perf_counter()` before and after the API call.

**Confidence scoring —** `BaseAgent` provides a default implementation: `get_confidence(output: AgentOutput) -> float` returns 0.5 for any output with content and 0.0 for any output with an error. Subclasses must override this with domain-specific logic.

**Database logging —** After every `invoke()` call (success or failure), `BaseAgent` calls `AgentLogRepository.create(output)` to persist the `AgentOutput` to the `agent_logs` PostgreSQL table (defined in Phase 2). This is fire-and-forget — logging failures are caught and logged to stderr but do not affect the returned `AgentOutput`.

## Instructions

**Files to create:**

- `agents/base_agent.py` — the abstract `BaseAgent` class
- `agents/models.py` — `AgentInput` and `AgentOutput` Pydantic models
- `agents/exceptions.py` — `AgentRetryError` and `AgentInputError` domain exceptions

**`AgentInput` and `AgentOutput` —**
Both are Pydantic `BaseModel` subclasses. `AgentOutput` includes a class method `error_output(agent_name, error_message, latency_ms)` that constructs a failed output with `confidence=0.0`, `tokens_used=0`, and `output=''`. This is called in all error branches of `BaseAgent.invoke()`.

**`BaseAgent` class structure —**

- Abstract class (Python `ABC`)
- `name: str` — abstract class variable, set by each subclass
- `abstract async def _call_llm(self, input: AgentInput) -> tuple[str, int]` — returns `(output_text, tokens_used)`. Subclasses implement this — they handle the actual Anthropic API call and prompt construction.
- `async def invoke(self, input: AgentInput) -> AgentOutput` — concrete, implemented in BaseAgent. Contains the retry loop, timing, error handling, and logging call.
- `def get_confidence(self, output: AgentOutput) -> float` — non-abstract, provides the default implementation. Subclasses override.

**Retry loop in `invoke()` —**
Use `asyncio.sleep()` for backoff — not `time.sleep()` (this is an async method). Catch specific Anthropic exception types in order: `BadRequestError` first (no retry), then `APIStatusError` (retry with backoff), then `APIConnectionError` (retry with 5s wait), then all other `Exception` (no retry, log to stderr). After max retries exceeded, return `AgentOutput.error_output(...)`.

**Logging —**
Call `await agent_log_repository.create(output)` inside a `try/except Exception` block. On logging failure: `sys.stderr.write(f"[WARN] Agent log failed: {e}\n")`. Do not re-raise.

**`requirements.txt` additions:** `anthropic>=0.28.0`, `pydantic>=2.7.0`

## Verification

I'll verify this implementation automatically. I can:

- Instantiate a concrete subclass of `BaseAgent` → call `invoke(input)` with a valid input → expect an `AgentOutput` with `error=None` and `latency_ms > 0`.
- Mock the Anthropic client to raise `APIStatusError` 3 times → call `invoke()` → expect 3 retry attempts and then an `AgentOutput` with `error` set (not a raised exception).
- Mock `APIConnectionError` → expect a 5-second wait between retries.
- Mock `BadRequestError` → expect 0 retries and immediate return with error output.
- Mock the `AgentLogRepository` to throw → expect the `invoke()` method to still return the output (logging failure is non-fatal).
- Suggest improvements before we move to the next step.

For manual testing, I'll guide you step-by-step through:

- Create a minimal `TestAgent(BaseAgent)` subclass that calls Claude with a fixed prompt → call `invoke()` in a Python REPL → verify the `AgentOutput` has a non-empty `output` and `confidence=0.5` (default implementation).
- Check the `agent_logs` table in the database → verify a row was inserted with the correct `agent_name`, `latency_ms`, and `tokens_used`.

Then give me your honest assessment of:

- Whether `async def invoke()` with `asyncio.sleep()` for backoff is the right approach when this code runs inside FastAPI endpoints that may also be using concurrent async processing — specifically, whether there is a risk of blocking other requests during the backoff sleep if the event loop is misused anywhere.

---

## [ ] [29] We're building the SentimentAgent for Meridian — the specialized agent that analyzes a batch of source texts for market sentiment on a given topic using Claude's structured output.

**Inherits from `BaseAgent` (built in [28]) —** The SentimentAgent overrides `_call_llm()` (the LLM call with its prompt) and `get_confidence()` (domain-specific confidence scoring). It does not override `invoke()` — all retry, timing, and logging logic is inherited.

**Input contract —** The `task` field of `AgentInput` contains the topic to analyze (e.g., "NVIDIA Q3 earnings"). The `context` dict must contain a key `sources: list[dict]` where each dict has `text` (string), `type` (one of: `'news'`, `'social'`, `'filing'`, `'analyst_report'`), and `published_at` (ISO datetime string). The agent validates that at least 1 source is provided — if 0 sources are provided, it returns an `AgentOutput` with `confidence=0.0` and `output='{"error": "No sources provided"}'` without calling the LLM.

**Claude prompt structure —** Uses Claude's tool use feature (structured output) to enforce a typed response. The tool definition specifies a schema with: `sentiment` (enum: `bullish` | `bearish` | `neutral`), `confidence` (float 0.0–1.0), `summary` (string, max 200 chars), `key_themes` (list of strings, max 5), `contradicting_signals` (list of strings, max 3), `source_quality_score` (float 0.0–1.0 — the agent's assessment of source reliability).

**Confidence override —** The `SentimentAgent.get_confidence()` method uses the model's self-reported `confidence` from the tool response, weighted by `source_quality_score` and source count: `final_confidence = model_confidence * source_quality_weight * min(1.0, source_count / 5)`. This means 5+ sources give full weight; fewer sources reduce confidence proportionally. `source_quality_weight` is: `0.5` if all sources are `social`, `0.75` if mixed, `1.0` if majority are `news`, `filing`, or `analyst_report`.

**Output serialization —** The `output` field of `AgentOutput` is the full tool response serialized as a JSON string. Callers that need the structured data parse it with `json.loads(output)`. This contract is documented in the `SentimentAgent` class docstring.

## Instructions

**File:** `agents/sentiment_agent.py`

**Class variables:**

- `name = 'sentiment_agent'`
- `model = 'claude-3-5-sonnet-20241022'` — the specific model version to use. Do not use a generic alias like `claude-3-5-sonnet` — pin the exact version.
- `tool_name = 'report_sentiment'` — the name of the structured output tool

**`_call_llm()` implementation steps —**

1. Validate `len(context.get('sources', [])) >= 1`. If 0: return `('{"error": "No sources provided"}', 0)`.
2. Build the system prompt: "You are a financial market sentiment analyst. Analyze the provided sources for sentiment on the given topic. Be precise and evidence-based. Do not extrapolate beyond what the sources support."
3. Build the user message: concatenate the topic from `input.task` and the source texts (each prefixed with its type and date).
4. Define the `report_sentiment` tool with the schema described in the specification.
5. Call `anthropic.Anthropic().messages.create(model=self.model, max_tokens=input.max_tokens, tools=[tool_definition], tool_choice={"type": "tool", "name": self.tool_name}, messages=[{"role": "user", "content": user_message}], system=system_prompt)`.
6. Extract the tool use block from `response.content` where `block.type == 'tool_use'`.
7. Return `(json.dumps(block.input), response.usage.input_tokens + response.usage.output_tokens)`.

**`get_confidence()` implementation —**
Read `confidence`, `source_quality_score` from `json.loads(output.output)`. Calculate `source_count` from `input.context['sources']`. Apply the weighting formula from the specification. Clamp result to `[0.0, 1.0]`. If `output.error` is not None: return `0.0`.

**`SentimentAgent` is not abstract —** It does not need a `_call_llm` abstract method annotation — it is a concrete implementation.

## Verification

I'll verify this implementation automatically. I can:

- Instantiate `SentimentAgent` → call `invoke()` with 3 news sources about NVIDIA earnings → expect `AgentOutput` with `error=None`, `output` parseable as JSON with all required fields.
- Call with 0 sources → expect `AgentOutput` with `confidence=0.0` and `output` containing `{"error": "No sources provided"}` — no LLM call made.
- Call with 5 `social` type sources → expect `get_confidence()` to return ≤ 0.5 (social penalty applied).
- Call with 5 `analyst_report` sources → expect `get_confidence()` to return higher than the social case for the same model confidence.
- Suggest improvements before we move to the next step.

For manual testing, I'll guide you step-by-step through:

- Run the agent in a Python REPL with 3 real news excerpts about a public company → print the `AgentOutput` → verify the `sentiment`, `key_themes`, and `contradicting_signals` fields are populated and reasonable.
- Check the `agent_logs` table → verify the `SentimentAgent` row exists with the correct `tokens_used` count.

Then give me your honest assessment of:

- Whether pinning the model to `claude-3-5-sonnet-20241022` (a specific date-versioned snapshot) is the correct long-term strategy — or whether a version alias would be safer, considering that Anthropic deprecates specific versions and pinning could cause unexpected failures when the version is retired.

---

## [ ] [30] We're building the SynthesisOrchestrator for Meridian — the component that combines outputs from all four analytical agents (Sentiment, Competitive, Regulatory, Technical) into one final research report, resolving disagreement and enforcing the Regulatory agent's override authority.

**Why this isn't a binary vote —** Meridian's agents don't vote yes/no on a single proposal the way a trading council does; they each produce an independent analytical opinion that has to be synthesized into one report. That doesn't mean the edge cases are any softer — disagreement, timeout, and override authority all still have to be handled explicitly, just in a synthesis pattern instead of a quorum pattern.

**Fan-in pattern —** The orchestrator calls Sentiment, Competitive, Regulatory, and Technical concurrently via `asyncio.gather()`, waits up to 45 seconds total, then invokes the Summary agent (built separately, not covered in this prompt) with all four outputs as its `previous_outputs`.

**Disagreement detection —** If Sentiment reports `bullish` with `confidence >= 0.7` and Technical reports `bearish` with `confidence >= 0.7` in the same run, this is a **conflict**, not something to silently average away. The orchestrator's output includes a `conflicts: list[ConflictRecord]` field — each record names the two disagreeing agents, their respective sentiment/confidence, and is surfaced in the final report rather than resolved by the orchestrator itself. Meridian's users are analysts; hiding disagreement between two independent signals removes the most useful part of the report.

**Regulatory override — the authority rule that must never be silently dropped —** The Regulatory agent's structured output (built separately) contains a boolean field `compliance_flag`. If `compliance_flag == true` for any source: the orchestrator MUST (1) add a mandatory disclaimer section to the final report regardless of what the other three agents concluded, and (2) apply a fixed `-0.3` penalty to the overall `synthesis_confidence` field, floored at `0.0`. This cannot be skipped even if all three other agents unanimously report high-confidence bullish sentiment — Regulatory's flag always wins.

**Minimum participation —** At least 2 of the 4 analytical agents must return a non-error output for the orchestrator to produce a report at all. If only 0 or 1 succeed, the orchestrator returns an error state (`SynthesisResult.error = "insufficient_agent_participation"`) rather than a low-confidence guess built from a single opinion.

**Timeout and malformed-output handling — identical treatment —** An agent that doesn't respond within 45 seconds and an agent whose `output` field fails `json.loads()` are treated the same way: excluded from synthesis, and named in a `degraded: list[str]` field on the final result (e.g., `["technical_agent"]`) so the report is honestly labeled as partial rather than silently presented as complete.

## Instructions

**File:** `orchestration/synthesis_orchestrator.py`

**Class:** `SynthesisOrchestrator` — not an agent itself, does not inherit from `BaseAgent`.

**`async def synthesize(self, task: str, session_id: str, context: dict) -> SynthesisResult`:**

1. Build one `AgentInput` per analytical agent (Sentiment, Competitive, Regulatory, Technical) from `task`, `session_id`, and `context`.
2. `results = await asyncio.wait_for(asyncio.gather(*[agent.invoke(input) for agent in self.agents], return_exceptions=True), timeout=45.0)`. Wrap the whole gather in `try/except asyncio.TimeoutError` — on timeout, mark every agent that hadn't completed as `degraded`.
3. For each result: if it's an `Exception` (not an `AgentOutput`), or if `result.error is not None`, or if `json.loads(result.output)` raises — treat identically: append the agent's name to `degraded`, exclude it from synthesis.
4. If `len(analytical_agents) - len(degraded) < 2`: return `SynthesisResult(error="insufficient_agent_participation", degraded=degraded)` immediately — do not call the Summary agent.
5. Check every successfully-parsed Regulatory output for `compliance_flag == true`. If any source flagged: set `regulatory_override = True`.
6. Detect conflicts: compare Sentiment vs. Technical outputs (the two directional signals) — if both `confidence >= 0.7` and their `sentiment` fields point opposite directions (`bullish` vs `bearish`), append a `ConflictRecord`.
7. Compute `synthesis_confidence` as the mean of the successfully-parsed agents' individual confidences, then apply the `-0.3` penalty if `regulatory_override` is true, floored at `0.0` with `max(0.0, value)`.
8. Call the Summary agent with all successfully-parsed outputs as `previous_outputs`, and the `conflicts`, `regulatory_override`, and `degraded` fields included in its `context` so the summary explicitly narrates disagreement and data quality rather than presenting a falsely clean report.
9. Return `SynthesisResult` containing: the Summary agent's output, `synthesis_confidence`, `conflicts`, `degraded`, `regulatory_override`.

**`SynthesisResult` shape (Pydantic model in `orchestration/models.py`):** `report: str | None`, `synthesis_confidence: float`, `conflicts: list[ConflictRecord]`, `degraded: list[str]`, `regulatory_override: bool`, `error: str | None`.

**`ConflictRecord` shape:** `agent_a: str`, `agent_b: str`, `agent_a_position: str`, `agent_b_position: str`.

## Verification

I'll verify this implementation automatically. I can:

- Mock all 4 analytical agents to succeed with agreeing sentiment → expect `SynthesisResult` with `conflicts=[]`, `regulatory_override=False`, `error=None`.
- Mock Sentiment `bullish` @ 0.8 confidence and Technical `bearish` @ 0.75 confidence → expect exactly one `ConflictRecord` in the result.
- Mock Regulatory returning `compliance_flag=true` with all other agents unanimous and highly confident → expect `regulatory_override=True` and `synthesis_confidence` reduced by exactly 0.3 from the unpenalized mean.
- Mock only 1 of 4 agents succeeding → expect `error="insufficient_agent_participation"` and the Summary agent is never called (assert no call made).
- Mock one agent exceeding the 45-second timeout → expect it appears in `degraded` and synthesis proceeds with the remaining 3.
- Mock an agent returning `output="not valid json{"` → expect identical handling to the timeout case (appears in `degraded`, excluded, not raised as an exception).
- Suggest improvements before we move to the next step.

For manual testing, I'll guide you step-by-step through:

- Run `synthesize()` in a Python REPL with a real topic and real source context → inspect the returned `SynthesisResult` → confirm `conflicts` and `degraded` are empty on a clean run.
- Deliberately feed contradictory source texts (bullish news article + bearish analyst report) → confirm a `ConflictRecord` appears and the Summary agent's report text actually mentions the disagreement rather than picking a side silently.

Then give me your honest assessment of:

- Whether a hard 2-of-4 minimum-participation rule is the right floor for every use of Meridian, or whether Regulatory specifically should be treated as mandatory regardless of how many other agents respond — since a report that omits compliance screening entirely is arguably worse than a report that's merely missing one analytical opinion.

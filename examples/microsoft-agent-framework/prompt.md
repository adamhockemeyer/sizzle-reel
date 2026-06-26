# Prompt

A representative prompt that drives the skill to produce the Microsoft Agent Framework reel. The skill
responds to natural language — you don't need to phrase it exactly like this. The interesting part here
is briefing a subject that has **no UI to screenshot**.

---

> Make a cinematic sizzle reel for the **Microsoft Agent Framework** for its README.
>
> There's no product UI — it's an open-source library (.NET + Python) for building production AI agents
> and multi-agent workflows. So *assemble* the interface instead of screenshotting one: real code panels,
> model-provider nodes, interop nodes, and an animated multi-agent **workflow graph** — the graph is the
> literal thing the framework builds, so make it the hero beat.
>
> Cover the breadth: one Agent that runs in **Python and .NET** with the same API, **bring-any-model**
> (Azure OpenAI, OpenAI, Anthropic, Gemini, Bedrock, Ollama), the open-interop story
> (**MCP · A2A · Agent Skills · AG-UI**), graph **workflows** (sequential, concurrent, handoff, group —
> with checkpointing, human-in-the-loop, time-travel), and the **production** story (OpenTelemetry,
> durable/restartable, Foundry-hosted, GA 1.0). Close on the repo + MS Learn links.
>
> Refresh the current MAF docs before writing any on-screen code so package names and APIs are accurate.
> Use a subtle agent-graph backdrop in a Microsoft/Azure palette. Render deterministically to an MP4 plus
> a slim README GIF.

---

## Notes on what the skill did with this

- **Refreshed the source of truth first.** Pulled current MAF docs (GitHub README + MS Learn) so every
  snippet — `from agent_framework import Agent`, `client.AsAIAgent(...)`, the workflow patterns — matches
  the GA 1.0 APIs instead of stale training data. Don't put unverified code in a reel.
- **Picked the backdrop from the subject.** An agent-graph constellation, because MAF *is* an
  agent-orchestration framework — recolored to Azure blue/indigo so it reads as Microsoft, not the
  skill's stock cyan/violet. (See [`references/backdrops.md`](../../skills/sizzle-reel/references/backdrops.md).)
- **Assembled the "UI" for a library.** No app screenshots — code panels, provider/interop nodes, and an
  SVG workflow graph built from primitives, all driven by the deterministic seek harness.
- **Made the mechanism the hero.** The multi-agent workflow graph (fan-out → converge, with the
  orchestration-pattern pills) is the climax, because that's what makes MAF different from a single
  prompt loop.

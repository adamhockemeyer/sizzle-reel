# Prompt

A representative prompt that drives the skill to produce the Microsoft Agent Framework reel. The skill
responds to natural language — you don't need to phrase it exactly like this. The interesting part here
is briefing a subject that has **no UI to screenshot**.

---

> Make a cinematic sizzle reel for the **Microsoft Agent Framework** for its README.
>
> There's no product UI — it's an open-source library (.NET + Python) for building production AI agents
> and multi-agent workflows. So *assemble* the interface instead of screenshotting one: real code panels,
> a **live agent chat**, model-provider nodes, interop nodes, and an animated multi-agent **workflow
> graph** — the graph is the literal thing the framework builds, so make it a hero beat.
>
> Ground it in a real **enterprise scenario** so it's not a toy: an **insurance claims triage** agent
> (intake → policy lookup → fraud check → human adjuster handoff). Make the **streaming chat the
> centerpiece** — show the agent's tool calls running and a human-in-the-loop handoff, so it feels real.
>
> Cover the breadth: one Agent that runs in **Python and .NET** with the same API, **bring-any-model**
> (Azure OpenAI, OpenAI, Anthropic, Gemini, Bedrock, Ollama), the open-interop story
> (**MCP · A2A · Agent Skills · AG-UI**), graph **workflows** (sequential, concurrent, handoff,
> human-in-the-loop, checkpointed), and a **production & trust** beat (Entra identity, human-in-the-loop,
> OpenTelemetry, durable/restartable, Foundry-hosted, GA 1.0). Use **real product icons** where you can
> (official Azure/Microsoft icons + the MCP logo); keep other vendors as plain text. Close on the
> **install command**, not just links.
>
> Refresh the current MAF docs before writing any on-screen code so package names and APIs are accurate.
> Use a subtle agent-graph backdrop in a Microsoft/Azure palette. Render deterministically to an MP4 plus
> a slim README GIF.

---

## Notes on what the skill did with this

- **Refreshed the source of truth first.** Pulled current MAF docs (GitHub README + MS Learn) so every
  snippet — `from agent_framework import Agent`, `client.AsAIAgent(...)`, the workflow patterns — matches
  the GA 1.0 APIs instead of stale training data. Don't put unverified code in a reel.
- **Led with a recognizable outcome.** The claims-triage scenario makes the demo read as a real business
  workflow, not a generic chatbot — then closed on the literal next action (`pip install` / `dotnet add`).
- **Made a real conversation the centerpiece.** A streaming chat with actual `policy_lookup` / `fraud_check`
  tool-call chips and a human-adjuster handoff is what makes a *library* feel alive.
- **Picked the backdrop from the subject.** An agent-graph constellation, because MAF *is* an
  agent-orchestration framework — recolored to Azure blue/indigo so it reads as Microsoft, not the
  skill's stock cyan/violet. (See [`references/backdrops.md`](../../skills/sizzle-reel/references/backdrops.md).)
- **Used real icons, carefully.** Official Azure service icons (Azure OpenAI, Entra, Foundry, App Insights,
  Monitor) and the MCP logo; other model vendors stay as plain text to avoid third-party trademark issues.
- **Made the mechanism the hero.** The multi-agent workflow graph (fan-out → converge, human-in-the-loop
  adjuster) is the climax, because that's what makes MAF different from a single prompt loop.

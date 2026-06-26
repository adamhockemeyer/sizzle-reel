# Example: Microsoft Agent Framework reel

A sizzle reel for the **[Microsoft Agent Framework (MAF)](https://github.com/microsoft/agent-framework)** —
an open, multi-language framework for building production-grade AI agents and multi-agent workflows in
.NET and Python.

This is the **"no product UI"** case: MAF is a library, not an app you can screenshot. The reel proves the
skill can dramatize a *framework* by assembling its real artifacts — Python/.NET code, model-provider and
interop nodes, and an animated multi-agent **workflow graph** (the literal thing MAF builds) — over a
subtle Azure-palette constellation backdrop.

| | |
| --- | --- |
| **Duration** | ~47s |
| **Backdrop** | Subtle agent-graph constellation, recolored to a Microsoft/Azure palette (the graph *is* the product) |
| **Scenes** | Title → one Agent in Python & .NET → bring any model → open interop (MCP · A2A · Skills · AG-UI) → workflow graph (sequential/concurrent/handoff/group) → production (OpenTelemetry · durable · Foundry-hosted · GA 1.0) → close |
| **Signature moves** | Real, accurate code panels; mechanism dramatization (provider/interop/graph nodes drawn on); animated chat streaming; graph-forward hero beat |

Everything on screen is verified against current MAF docs (GA 1.0): packages `agent-framework`
(Python) / `Microsoft.Agents.AI` (.NET), the `Agent` / `AIAgent` APIs, the orchestration patterns, and
first-class MCP / A2A / Agent Skills / AG-UI support.

## Output

![Microsoft Agent Framework sizzle reel](microsoft-agent-framework.gif)

▶ Higher quality: [`microsoft-agent-framework.mp4`](microsoft-agent-framework.mp4)

## Prompt

See [`prompt.md`](prompt.md) for the kind of natural-language prompt that produces a reel like this —
including how to brief the skill when the subject has **no website**.

## How it was rendered

The scene source ([`index.html`](index.html)) is committed so the reel is reproducible. Vendor
three.js + GSAP into `./vendor` first (`npm i three gsap`, then copy
`three/build/three.module.min.js`, `three/build/three.core.min.js`, and `gsap/dist/gsap.min.js`), then:

```bash
node ../../skills/sizzle-reel/scripts/smoke.mjs   --dir .
node ../../skills/sizzle-reel/scripts/capture.mjs --dir . --fps 30 --w 1600 --h 900
node ../../skills/sizzle-reel/scripts/encode.mjs  --frames ./frames --out . --name microsoft-agent-framework
```

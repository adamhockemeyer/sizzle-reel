# sizzle-reel

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-6f42c1)](https://agentskills.io)
[![Runs in](https://img.shields.io/badge/runs%20in-Copilot%20CLI%20%C2%B7%20Claude%20Code-2188ff)](#install)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-555)](#requirements)

An **agent skill** that builds a cinematic, self-contained animated **sizzle reel** for your
project's README — real product screenshots revealed panel-by-panel over a subtle 3D backdrop,
rendered **deterministically** to MP4 + GIF. No screen recording, no live backend, no flaky
"15 seconds of a loading spinner." You ask your coding agent; it designs the scenes, renders
them headlessly, and hands you an `.mp4` + a README-ready `.gif`.

<!--
  HERO MEDIA — drop the generated reel here.
  GIF (committed, autoplays everywhere) is the reliable visual.
  For the punchier autoplaying MP4: drag examples/context-engine/context-engine.mp4 into any
  GitHub PR/issue comment, copy the user-attachments URL it mints, and paste it below.
-->
<p align="center">
  <img width="720" alt="A sizzle reel built by this skill (the Context Engine reel)"
       src="examples/context-engine/context-engine.gif" />
</p>

> ▶ **Higher-quality MP4:** [`examples/context-engine/context-engine.mp4`](examples/context-engine/context-engine.mp4)
> &nbsp;·&nbsp; built with this skill — see [`examples/`](examples/) for the prompt that produced it.

Built on:

- **three.js** (WebGL) — a subtle, content-aware 3D backdrop (chosen to fit *your* product, not a stock look)
- **GSAP** on a paused, deterministic-seek timeline — every frame is reproducible
- **Playwright** — headless frame-by-frame capture
- **ffmpeg** — encode to MP4 (libx264) + a slim README-inline GIF (+ poster)

Pure Node, cross-platform (Windows / macOS / Linux), no PowerShell required.

## Install

This is an [Agent Skills](https://agentskills.io) skill, so it works across **72+ coding agents**
(GitHub Copilot CLI, Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Windsurf, Zed, and more).

### One-liner (recommended)

The [`skills`](https://github.com/vercel-labs/skills) CLI detects the agents you have installed and
drops the skill into the right place for each:

```bash
# install globally (available across all your projects)
npx skills add adamhockemeyer/sizzle-reel -g

# or install into the current project only (default)
npx skills add adamhockemeyer/sizzle-reel
```

Add `-a github-copilot` / `-a claude-code` to target a specific agent, or `--copy` if your OS
doesn't support symlinks.

### Manual (git clone)

Each agent auto-discovers skill folders in its own directory:

| Agent | Global skills dir | Invoke |
| --- | --- | --- |
| **GitHub Copilot CLI** | `~/.copilot/skills/sizzle-reel/` | just ask: *"make a sizzle reel for this project"* |
| **Claude Code** | `~/.claude/skills/sizzle-reel/` | `/sizzle-reel`, or just ask |
| Other Agent Skills hosts | see [agentskills.io](https://agentskills.io) | varies |

```bash
git clone https://github.com/adamhockemeyer/sizzle-reel.git
# Windows (Copilot CLI):
xcopy /E /I sizzle-reel\skills\sizzle-reel "%USERPROFILE%\.copilot\skills\sizzle-reel"
# macOS / Linux (Copilot CLI):
cp -r sizzle-reel/skills/sizzle-reel ~/.copilot/skills/sizzle-reel
# Claude Code: copy to ~/.claude/skills/sizzle-reel instead
```

## Usage

There's no fixed syntax — just ask your agent in natural language. All of these trigger the skill:

```
make a sizzle reel for this project
```
```
create an animated demo GIF for my README
```
```
build a cinematic product video showing what this app does
```

It also auto-triggers on phrases like *sizzle video*, *README video*, *animated demo video*,
*product hype video*, *intro animation*, *cinematic project trailer*, *GitHub readme gif/mp4*.

### What the agent does when you ask

1. **Inspects your product** — README, screenshots, domain, brand colors — and picks a backdrop and
   palette that fit *it* (not a default graph look).
2. **Installs the render tooling** for you on first use (`npm i -D playwright three gsap ffmpeg-static`
   + `npx playwright install chromium`). You don't do this by hand.
3. **Authors 4–6 scenes** (Title → Differentiator → Demo → Core capability → Close), grounded in your
   real screenshots.
4. **Smoke-tests, captures, encodes** — fast sanity check, then a deterministic headless render to
   MP4 + GIF, and verifies the *encoded* video isn't black before declaring done.

## Example outputs

Real reels produced by this skill. Each folder has the **prompt** used and the **output media**.

| Example | Subject | Prompt → result |
| --- | --- | --- |
| [`context-engine`](examples/context-engine/) | A graph/RAG "context engine" | Neural-graph backdrop, 5 scenes, panel-by-panel reveal of dashboard / schema / graph / streamed answer |
| [`microsoft-agent-framework`](examples/microsoft-agent-framework/) | An open-source framework (**no UI**) | Assembled "interface": real Python/.NET code, a **live claims-triage agent chat** (tool calls + human handoff), real product icons, and an animated multi-agent workflow graph — Azure palette |

> More examples coming. Built a good one? PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## How it works

The whole trick is a **paused GSAP timeline driven by a single seek function**, so a headless capture
can step a virtual clock frame-by-frame and get identical output every run:

```
references/engine-template.html      <- copy into your project, swap in product-fitting scenes
        |  node scripts/smoke.mjs     <- fast sanity (~90s): seek ~16 beats, fail on any error
        v
  node scripts/capture.mjs           <- deterministic headless render -> 1 PNG per frame (1600x900)
        |
        v
  node scripts/encode.mjs            -> MP4 (libx264, +faststart) + slim GIF (<=~8 MB) + poster
        |  --sync <readme media dir>
        v
  README.md  <- ![demo](.../reel.gif) inline; link or drag-drop the .mp4 for autoplay
```

See [`skills/sizzle-reel/SKILL.md`](skills/sizzle-reel/SKILL.md) for the full contract and workflow.

## Requirements

The **only** thing you need preinstalled is **Node.js >= 18**. The skill installs everything else
(Playwright + Chromium, and ffmpeg via the `ffmpeg-static` npm package — no system ffmpeg needed)
the first time it renders.

If you'd rather use a system ffmpeg, one on your `PATH` (winget / brew / apt) also works; the encoder
auto-detects it and verifies it has `libx264`.

## What's inside

The installable skill lives in [`skills/sizzle-reel/`](skills/sizzle-reel/); the repo root holds
docs and showcase media (which never ship into your install). Paths below are relative to the skill folder.

| Path | What it is |
| --- | --- |
| `SKILL.md` | The skill entry point (the agent reads this). Setup, workflow, scene contract. |
| `references/engine-template.html` | Runnable three.js + GSAP deterministic-seek scaffold to start from. |
| `references/techniques.md` | The signature moves (real screenshots in 3D, panel-by-panel, animated chat, mechanism dramatization…). |
| `references/backdrops.md` | How to design a backdrop that *fits the product* instead of defaulting to a graph. |
| `references/scene-playbook.md` | Scene arc + timing. |
| `references/gotchas.md` | Traps (black headless frames, the "15s of loading screen" failure, seek-safety…). |
| `scripts/capture.mjs` | Playwright headless frame capture. |
| `scripts/encode.mjs` | Cross-platform ffmpeg encode → MP4 + GIF + poster. |
| `scripts/smoke.mjs` | Fast sanity check that the page renders non-black WebGL frames. |
| `examples/` | Showcase reels produced by this skill (prompt + output media). |

## License

[MIT](LICENSE) © Adam Hockemeyer

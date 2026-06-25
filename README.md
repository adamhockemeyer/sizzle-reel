# sizzle-reel

A [GitHub Copilot CLI](https://docs.github.com/copilot) **skill** for producing cinematic,
animated "sizzle reel" videos for project READMEs — the kind that combine real product
screenshots with a built-up, panel-by-panel reveal over a subtle 3D backdrop.

It bundles the working tech and the hard-won gotchas:

- **three.js** (WebGL) for a subtle, content-aware 3D backdrop
- **GSAP** on a paused, deterministic-seek timeline (every frame is reproducible)
- **Playwright** headless capture → PNG frame sequence
- **ffmpeg** encode → MP4 + a slim README-inline GIF (+ poster)

Everything is cross-platform (Windows / macOS / Linux) — pure Node, no PowerShell.

## Install

Copilot CLI auto-discovers any skill folder under `~/.copilot/skills/`. Drop this folder there:

- **Windows:** `%USERPROFILE%\.copilot\skills\sizzle-reel\`
- **macOS / Linux:** `~/.copilot/skills/sizzle-reel/`

```bash
git clone https://github.com/<you>/sizzle-reel.git
# Windows
xcopy /E /I sizzle-reel "%USERPROFILE%\.copilot\skills\sizzle-reel"
# macOS / Linux
cp -r sizzle-reel ~/.copilot/skills/sizzle-reel
```

Then just ask Copilot CLI to "make a sizzle reel for this project" — the skill triggers automatically.

## What's inside

| Path | What it is |
| --- | --- |
| `SKILL.md` | The skill entry point (Copilot reads this). Setup, workflow, scene contract. |
| `references/engine-template.html` | Runnable three.js + GSAP deterministic-seek scaffold to start from. |
| `references/techniques.md` | The signature moves (real screenshots, panel-by-panel, animated chat, mechanism dramatization…). |
| `references/backdrops.md` | How to design a backdrop that *fits the product* instead of defaulting to a graph. |
| `references/scene-playbook.md` | Scene arc + timing. |
| `references/gotchas.md` | Traps (black headless frames, the "15s of loading screen" failure, seek-safety…). |
| `scripts/capture.mjs` | Playwright headless frame capture. |
| `scripts/encode.mjs` | Cross-platform ffmpeg encode → MP4 + GIF + poster. |
| `scripts/smoke.mjs` | Fast sanity check that the page renders non-black WebGL frames. |

## Requirements

Per-project (the skill's `SKILL.md` walks you through these on first use):

```bash
npm i -D playwright three gsap ffmpeg-static
npx playwright install chromium
```

`ffmpeg-static` ships a full static ffmpeg (with `libx264`) for all platforms, so no manual
ffmpeg install is needed. A system ffmpeg on `PATH` (winget / brew / apt) also works.

## License

MIT

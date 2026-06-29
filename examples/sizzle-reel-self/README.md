# Example: sizzle-reel (the skill itself)

A sizzle reel **for the sizzle-reel skill** — a CLI/agent tool that turns any repo into a deterministic,
cinematic README video (three.js + GSAP, captured headless with Playwright, encoded to MP4 + GIF with
ffmpeg).

This is the **self-referential** case, and it exists to prove one thing: the three examples in this repo
aren't three versions of the same look. The subject here is a **developer tool with no UI to screenshot**,
so the "interface" is *assembled* — a re-created **streaming terminal** and a literal **filmstrip** — and
every visual axis is deliberately pushed away from the other two reels: a **warm amber/gold-on-charcoal**
palette instead of cool cyan/violet, a **drifting-motes** backdrop instead of an agent/knowledge graph, and
a **frames → film transformation** story instead of a card-and-chat tour.

| | |
| --- | --- |
| **Duration** | ~43.5s |
| **Backdrop** | Drifting light motes on charcoal — evokes film/dust flowing through a gate (deliberately *not* a graph) |
| **Palette** | Warm cinematic: amber/gold (`#ffb454` / `#ffd27a`) on near-black (`#0c0a07`), with a film-red (`#ff5e57`) REC accent |
| **Scenes** | Title → the differentiator (a struck-through "screen recording" + a glowing **REC** pill) → **streaming terminal** hero (capture actions stream in with a progress bar + spinner) → **frames → film** mechanism (captured frames fly onto a filmstrip, a playhead sweeps across, then collapse into `sizzle.mp4` + `sizzle.gif`) → built-on / deterministic (real **three.js · GSAP · Playwright · ffmpeg** icons + three pillars) → close on the **install command** |
| **Signature moves** | Mechanism-as-hero **filmstrip with a sweeping playhead**; a **live streaming terminal** (action lines, progress bar, blinking caret, spinner) that makes a *build tool* feel alive; **real build-stack icons**; warm filmstrip palette that reads as "cinema," not "dashboard" |

Everything is the deterministic paused-GSAP-seek harness the skill ships: all per-frame state (caret blink,
spinner glyph, dust drift, playhead position) is a pure function of time, so a cold seek reproduces the exact
frame and the render is reproducible. The build-stack icons are real, permissively-sourced logos
(three.js / GSAP / ffmpeg as white monochrome via Simple Icons; the official Playwright logo from
playwright.dev).

## Output

![sizzle-reel self-referential sizzle reel](sizzle-reel-self.gif)

▶ Higher quality: [`sizzle-reel-self.mp4`](sizzle-reel-self.mp4)

## Prompt

See [`prompt.md`](prompt.md) for the kind of natural-language prompt that produces a reel like this —
including how to brief the skill to *diverge* from existing examples instead of cloning them.

## How it was rendered

The scene source ([`index.html`](index.html)) and the icon [`assets/`](assets/) are committed so the reel is
reproducible. Vendor three.js + GSAP into `./vendor` first (`npm i three gsap`, then copy
`three/build/three.module.min.js`, `three/build/three.core.min.js`, and `gsap/dist/gsap.min.js`), then:

```bash
node ../../skills/sizzle-reel/scripts/smoke.mjs   --dir .
node ../../skills/sizzle-reel/scripts/capture.mjs --dir . --fps 30 --w 1600 --h 900
node ../../skills/sizzle-reel/scripts/encode.mjs  --frames ./frames --out . --name sizzle-reel-self
```

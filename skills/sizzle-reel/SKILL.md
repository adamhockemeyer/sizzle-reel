---
name: sizzle-reel
description: |
  Build a cinematic, self-contained animated "sizzle" video for a project README or demo — no screen
  recording, no live backend, fully deterministic so it renders identically every time. Uses three.js
  (WebGL) for an animated backdrop, GSAP for a paused seek-driven timeline, Playwright for headless
  frame capture, and ffmpeg to encode an MP4 + slim README-inline GIF.
  USE FOR: "sizzle video", "sizzle reel", "README video", "animated demo video", "product hype video",
  "intro animation", "marketing animation for my repo", "make a video showing off my project",
  "GitHub readme gif/mp4", "three.js animation video", "cinematic project trailer".
  DO NOT USE FOR: recording a live app screen (use a real screen recorder), editing existing video
  files, or static diagrams (use excalidraw/drawio).
---

# Sizzle Reel Builder

Produce a ~30–60s animated product reel as a **single standalone HTML file** rendered deterministically
to MP4 + GIF. The whole point: reproducible output you can re-render after any tweak, with zero live
infrastructure. This skill carries the working engine, capture script, and encode pipeline — adapt the
*scenes*, not the plumbing.

## When to use

A user wants an eye-catching animated video for a README, landing page, or demo — highlighting what a
product *does* and what makes it different — and is willing to express the content as web animation
rather than recording a live screen. If they just want a literal recording of their running app, point
them at a screen recorder instead; this skill is for crafted, on-brand motion that renders headlessly.

## Never point the capture at the live app (the "15s of loading screen" trap)

The #1 failure of automated product videos: an agent tries to **screen-record / screenshot the live
running app**, and instead films the **auth redirect, a spinner, or a "Loading…" state** — yielding a
reel that is 15 seconds of a login screen. This skill exists to make that impossible:

- The reel is a **single self-contained HTML file with NO live backend, login, or network calls.** It
  can't capture a loading screen because there's nothing loading.
- Real product UI enters as **static screenshots** you captured *once*, deliberately, composited into
  3D frames (see `references/techniques.md`) — never a live page mid-auth.
- The capture script drives `window.__seek()` on a **paused** timeline; it only screenshots after
  `window.__ready` (which waits for every `.shot` image to **decode** first).

If you genuinely must pull *fresh* screenshots from the live app to use as `.shot` assets, do it
carefully (authenticate first, wait for real content, hide loaders/freeze data) — see
**"Capturing real product screenshots"** in `references/techniques.md`. Do **not** wire the live app
into the reel itself.

## Design from the product — do NOT default to the graph backdrop

The template ships a particle/knowledge-graph backdrop because it fit *one* product (a graph/RAG engine).
**It is not the house style.** Reusing it on every reel is how every video ends up looking the same and
"AI-generated." Before building, **inspect the actual product** — its README, screenshots, domain, brand
accent colors, and tone — and choose/compose a backdrop and palette that belong to *that* product, kept
clean and subtle (behind the content, never competing with it). See `references/backdrops.md` for the
selection process, a domain→backdrop menu, drop-in recipes for non-graph backdrops, and the subtlety
rules. State your choice to the user in one line before you build.

## The one idea that makes this work: deterministic seek

Everything hangs off a **paused GSAP timeline** driven by a single seek function. The page never relies
on wall-clock playback for the final render — a headless capture steps a virtual clock frame-by-frame.

The HTML **must** expose this contract (the capture/smoke scripts depend on it verbatim):

```js
const DURATION = 46.0;                                   // seconds
const CAPTURE  = new URLSearchParams(location.search).has("capture");
const tl = gsap.timeline({ paused: true });              // build ALL animation on this
// ...build scenes with tl.to/tl.fromTo at absolute times...
window.__seek = (ms) => { const t = Math.min(Math.max(ms/1000,0),DURATION); tl.time(t); applyState(t); };
window.__duration = DURATION;
window.__ready = false;                                  // set true once assets decoded + first frame drawn
// live preview ONLY when not capturing:
if (!CAPTURE) { /* requestAnimationFrame loop calling __seek(now % DURATION) */ }
```

Rules that keep it seekable (any `t` must be reconstructible from scratch):

- Build with `tl.to` / `tl.fromTo` at **absolute start times**. Use `fromTo` (with default
  `immediateRender`) so elements sit in their "from" state before their scene.
- **Never** use `tl.call()`, `repeat:-1`, or anything order-dependent / side-effectful.
- Animate a plain `fx`/`camState` state object, then push it into three.js every frame inside
  `applyState(t)` (see template). Don't mutate GL state outside `applyState`.
- WebGL renderer needs `preserveDrawingBuffer: true` or headless screenshots come out **black**.

See `references/engine-template.html` for a complete, runnable skeleton (backdrop + harness + 2 sample
scenes). Copy it, then replace the scene timeline.

## Setup (dependencies — install before capturing)

The reel HTML itself has no build step, but the capture/encode tooling needs Node packages + ffmpeg:

```bash
npm init -y                          # if the project has no package.json
npm i -D playwright three gsap ffmpeg-static  # look up current versions; don't pin in the skill
npx playwright install chromium      # one-time browser download
# vendor the libs so the HTML is standalone/offline (no CDN):
mkdir -p web/sizzle/vendor
cp node_modules/three/build/three.module.min.js node_modules/three/build/three.core.min.js web/sizzle/vendor/
cp node_modules/gsap/dist/gsap.min.js web/sizzle/vendor/
```

ffmpeg (the encoder): the easiest, no-system-install path is the **`ffmpeg-static`** npm
package above — it drops a full static ffmpeg binary (WITH `libx264`) into `node_modules`
for Windows/macOS/Linux, and `encode.mjs` resolves it automatically from the project. No
`winget`/`brew`/`apt` needed. `encode.mjs` resolution order: `ffmpeg-static` → ffmpeg on
PATH → winget package dir → Playwright's bundled binary. It verifies each candidate has
`libx264` and skips ones that don't — **Playwright's bundled ffmpeg usually LACKS `libx264`
and cannot encode the MP4**, so don't rely on it. If you'd rather use a system ffmpeg:
Windows `winget install Gyan.FFmpeg`; macOS `brew install ffmpeg`; Linux `apt install ffmpeg`.
`three.module.min.js` imports `three.core.min.js` — vendor **both**.

## Build workflow

1. **Scaffold.** Copy `references/engine-template.html` into the project (e.g. `web/sizzle/index.html`).
   Vendor `three.module.min.js` (+ `three.core.min.js`) and `gsap.min.js` locally per Setup above.
   **Then choose the backdrop** to fit the product (see "Design from the product" above +
   `references/backdrops.md`) — swap the template's graph block for a fitting motif/palette if it doesn't
   match. The harness + seek contract stay; only the backdrop visuals change.
2. **Author scenes.** Design 4–6 beats on the timeline. Use `references/scene-playbook.md` for the
   proven structure (Title → Differentiator → Ask/Chat → Core-capability → Interfaces → Close) and the
   panel-vs-graph-forward mode pattern, and `references/techniques.md` for the signature *moves* (real
   screenshots in 3D frames, sequential panel-by-panel reveal, animated chat, mechanism dramatization).
   Animate the *actual differentiator* — and ground it in real product screenshots.
3. **Smoke-test (fast, ~90s).** `node scripts/smoke.mjs` seeks ~15–20 timestamps, screenshots each, and
   fails on any console/page error. Iterate here — do NOT full-capture to check a tweak.
4. **Measure positions** when adjusting layout (caption clipping, overlaps) by reading
   `getBoundingClientRect()` at a seeked time — cheaper and exact vs. eyeballing frames. Captions should
   sit ≥ ~74px off the frame bottom.
5. **Full capture (~10 min for 46s).** `node scripts/capture.mjs` writes 1 PNG per frame
   (DURATION × fps) at 1600×900.
6. **Encode.** Cross-platform (Win/macOS/Linux): `node scripts/encode.mjs --frames <dir>/frames
   --out <out> --name my-reel`. Produces MP4 (libx264, yuv420p, +faststart, CRF 20) + a slim GIF
   (palettegen/paletteuse, ~10fps, ≤8–9 MB) and can sync both to a README media dir (`--sync <dir>`).
7. **Verify the *encoded* MP4** (not just the page): extract a few frames from the final `.mp4`, confirm
   they aren't black and the new scenes are present. "It looked right in the browser" is not done.
8. **Embed.** GIF inline in README (`![alt](docs/media/<name>.gif)`); link the MP4 separately. For the
   high-quality MP4 in a GitHub README, drag-drop it into a PR/issue comment to mint a persistent
   user-attachment URL (that URL survives later README edits).

## Scripts (low freedom — run as-is, pass paths via flags/env)

| Script | Purpose |
| --- | --- |
| `scripts/smoke.mjs` | Seek N beats, screenshot each, assert zero errors. Run before every full capture. |
| `scripts/capture.mjs` | Deterministic frame-by-frame PNG capture via headless Chromium. |
| `scripts/encode.mjs` | **Cross-platform (Win/macOS/Linux)** ffmpeg encode → MP4 + slim GIF (+ poster), optional `--sync`. |

All three take the sizzle dir / page / output dir as parameters (see each file's header). They serve the
HTML over an ephemeral localhost HTTP server (ES modules can't load over `file://`).

## Tech choices (state these to the user; refresh versions before coding)

- **three.js (WebGL)** for the backdrop — not WebGPU. Broader headless support and you're rendering
  offscreen anyway; WebGPU buys nothing here and risks swiftshader gaps.
- **GSAP** for timing — its `tl.time()` seek + `fromTo`/`immediateRender` semantics are the whole trick.
- **Playwright (headless Chromium, `--use-angle=swiftshader`)** for capture — CPU-rendered, deterministic,
  CI-friendly. swiftshader is slow (~10 min/reel) — that's expected; iterate via smoke, not full captures.
- **ffmpeg** for encode. `encode.mjs` resolves it: `ffmpeg-static` npm package (zero system install, has libx264) → PATH → winget package → Playwright's bundle, verifying libx264 and skipping codec-less binaries.

## Gotchas

Read `references/gotchas.md` before debugging anything weird. The expensive ones: black frames
(`preserveDrawingBuffer`), SVG rotation pivoting wrong in GSAP (`svgOrigin`, not `transformOrigin`),
captions clipping the frame bottom, GSAP `y:0` dropping an element off its `translate(-50%,-50%)` centering,
and ID collisions when merging standalone scene prototypes into one reel.

## Reference files

| File | Contents |
| --- | --- |
| `references/engine-template.html` | Runnable backdrop + seek harness + 2 sample scenes. Start here. |
| `references/backdrops.md` | **Choosing a backdrop that fits the product** (not the stock graph): selection process, domain→motif menu, subtlety rules, drop-in non-graph recipes. |
| `references/techniques.md` | The signature *moves*: real screenshots in 3D frames, sequential panel reveal, animated chat, mechanism dramatization, + motion timing cheat-sheet. |
| `references/scene-playbook.md` | Scene structure, panel vs graph-forward modes, caption/tag patterns, timing. |
| `references/gotchas.md` | Hard-won traps and their fixes. |

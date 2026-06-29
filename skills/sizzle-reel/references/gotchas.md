# Sizzle Reel Gotchas

Hard-won traps from building these reels. Read before debugging anything that looks wrong.

## Your video is 15 seconds of a loading/login screen

**Cause:** Something pointed the capture at the **live running app** (a dev server, a deployed URL). What
got filmed was the auth redirect / OAuth handshake / a spinner / a "Loading…" state — not the product.

**Fix:** Don't capture the live app at all. The reel is a self-contained HTML file with **no backend, no
login, no network** — real UI comes in as **static screenshots** composited into frames, and the capture
script only screenshots a **paused** timeline after `window.__ready` (which waits for `.shot` images to
decode). There is no loading state to accidentally film. If you need *fresh* screenshots from the real
app, capture them separately and deliberately (auth first, wait for real content, hide loaders) — see
"Capturing real product screenshots" in `techniques.md` — then drop the PNGs in as `.shot` assets.

## Black / empty frames in capture (but page looks fine live)

**Cause:** Headless `page.screenshot()` reads the default framebuffer, which a WebGL renderer clears
after compositing unless told to preserve it.

**Fix:** Construct the renderer with `preserveDrawingBuffer: true`:
```js
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
```
Also: after each `__seek`, wait **two** animation frames before screenshotting (the capture script does
this) so the GL buffer is actually composited.

## The reel doesn't render headlessly at all

Launch Chromium with software GL so it works on any machine / CI:
```
--use-gl=angle --use-angle=swiftshader --enable-webgl --ignore-gpu-blocklist
```
swiftshader is CPU-rendered and **slow** (~10 min for a 46s/30fps reel). That's expected — iterate with
`smoke.mjs` (a dozen frames), never a full capture, while tuning.

## ES modules fail to load (CORS) over file://

You cannot open `index.html` directly from disk for capture — `import` from `./vendor/three.module.min.js`
is blocked by CORS on `file://`. The capture/smoke scripts spin up an ephemeral localhost HTTP server and
load `http://127.0.0.1:<port>/...`. Keep all vendored JS relative and local.

## SVG element rotates around the wrong point in GSAP

`transformOrigin: "50% 50%"` does **not** work reliably for SVG children. Use GSAP's `svgOrigin`, which
takes **user-space coordinates** (the SVG's own coordinate system), not percentages:
```js
tl.fromTo("#ring", { rotation: 0 }, { rotation: 360, duration: 5, ease: "none", svgOrigin: "800 470" });
```
Pick the coordinates of the element's visual center in the SVG viewBox.

## A centered element jumps/drops when you tween `y:0`

If an element is centered with CSS `transform: translate(-50%, -50%)` and you tween `{ y: 0 }`, GSAP
**overwrites the transform**, removing the `-50%` vertical centering. The element's top snaps to its CSS
`top:` value, so it visibly drops.

**Fixes (pick one):**
- Animate `yPercent` instead of `y`, or include the centering in the tween.
- Or set the element's resting `top:` to where you actually want it post-tween (e.g. `top:80%` instead of
  `top:86%`) so the "drop" lands correctly and doesn't collide with a caption below.

## Captions clipped at the bottom of the frame

Bottom-anchored captions at `bottom:46px` were clipped in a real player; `bottom:74px` was safe. Keep any
bottom caption **≥ ~74px** off the frame bottom. To check precisely, seek to the caption's beat and read
`getBoundingClientRect()` rather than eyeballing exported frames — confirm bottom ≤ frameHeight − 74 and
that it doesn't overlap any card above it.

## Text cut off by the letterbox bars (top kicker / tags)

The single most common clipping bug: **cinematic letterbox bars and top-anchored text fight for the same
pixels.** If the bars animate to `H` px and a top kicker/tag sits at `top: <H>` or less, the bar paints over
the top of the glyphs. (Real example: bars → 60px, `.tag` at `top:54px` → every section kicker was shaved.)

**Rule — define a safe area and keep all text inside it.** With letterbox bars of height `B`:
- Top text must start at **`top ≥ B + ~12px`** (bars at 60px → tags at `top:80px`).
- Bottom text must end at **`bottom ≥ B + ~14px`** (and ≥ 74px regardless, per above).
- Horizontally keep a **≥ ~28px** margin; never let a fixed-width line (terminal rows, long captions) run
  to the frame edge — give it a `max-width` and let it wrap instead.

**Don't eyeball it — the smoke script audits this automatically.** `smoke.mjs` runs a layout audit at every
beat that flags any visible text that **crosses the frame**, sits **under a letterbox bar**, or is **clipped
inside its own `overflow:hidden` box**, plus soft **near-edge** warnings inside the safe margin. It prints
the beat + a text snippet so you know exactly what to move. Treat any `✗` line as a must-fix:

```
[layout] beat-03 (8700ms): 1 issue(s)
   ✗ under-letterbox [666,54 267x17] "Not a screen recording"
```

Run `node …/smoke.mjs --dir . --strict` to make those hard failures (exit 1) — wire `--strict` into your
"is it done?" gate so a clipped reel can never be rendered/committed. Tune the soft margin with `--margin`.

## Animation looks right scrubbing live but a single seeked frame is wrong

The timeline must be **fully reconstructible at any arbitrary `t`** — `tl.time(t)` jumps there cold, with
no playback history. Things that break this:
- `tl.call()` / event callbacks (side effects don't replay on a backward/forward jump).
- `repeat: -1` / infinite loops (indeterminate state at a given `t`).
- `.to()` without a matching start state — use `fromTo` so the "from" is explicit and
  `immediateRender` parks the element correctly **before** its scene starts.
- Mutating three.js state outside `applyState(t)` — all per-frame GL state must be derived from the
  animated `fx`/`camState` objects inside `applyState`, so a cold seek reproduces it.

## ID collisions when merging standalone scene prototypes

You'll often prototype a scene as its own HTML file, then paste it into the master reel. Duplicate element
IDs (`#ring`, `#cap`, `#ans`, `#beam1`...) silently break GSAP selectors (it targets the first match).
Namespace per scene (`#sb-ring`, `#capB2`) when merging.

## Verify the *encoded* MP4, not the page

"It looked right in the browser" ≠ done. Black frames, palette banding, and caption clipping can appear
only after encode. Extract a few frames from the final `.mp4` (e.g. `ffmpeg -ss 5.5 -i out.mp4 -frames:v 1
check.png`) and inspect them. Then open the MP4 in a real player.

## GIF too large to inline in a README

GitHub inlines GIFs but they bloat fast. Levers, in order: lower `fps` (10 is fine), reduce `scale`
(width 520–600), cap `max_colors` (128–144), and use `dither=bayer:bayer_scale=5`. If still > ~9 MB, trim
the reel duration. Ship the crisp **MP4** as the primary asset (drag-drop into a PR/issue comment for a
persistent GitHub user-attachment URL) and use the GIF only as the inline preview.

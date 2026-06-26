# Signature Techniques

The reusable *moves* that make these reels feel crafted, not slideshowed. Mix and match — most
reels use 3–4 of these. The first two are the highest-value combo (real product + built-up panels).

## 1. Real screenshots in tilted 3D "device" frames

Composite actual product screenshots into a floating, slightly 3D-rotated window so the UI feels
tangible instead of pasted flat. This is what grounds the reel in the *real* product.

Recipe:
- A `.frame` container: fixed aspect, `border-radius`, `overflow:hidden`, `transform-style:preserve-3d`,
  a big soft `box-shadow` (depth) + a faint inset ring + a colored outer glow.
- Inside: `<img class="shot" src="...png" object-fit:cover>` (the real screenshot).
- A `.gloss` overlay on top: a diagonal `linear-gradient` highlight, so it reads like glass.
- Animate it in from depth: `gsap.set(frame,{rotationY:-12,rotationX:5,z:-420,opacity:0})` then
  `tl.to(frame,{opacity:1,z:0,rotationY:-6,rotationX:3,duration:1.1})`. The residual ~6° tilt is what
  sells "3D screen" without making text unreadable.
- Optional **Ken Burns**: a slow `scale:1.0→1.06` on the inner `.shot` during the hold, so a static
  screenshot still has life.

> Capture gotcha: the harness waits for every `.shot` image to **decode** before setting
> `window.__ready` (see engine-template). Without this, headless capture can grab blank frames.

### Capturing real product screenshots (auth + loading handled)

Where do the `.shot` PNGs come from? Capture them **once, deliberately** — never by pointing the reel at
the live app (that's the "15s of loading screen" trap). When grabbing them from a real running app:

- **Authenticate first, reuse the session.** Log in once interactively and save Playwright
  `storageState` (cookies + localStorage); load it for the screenshot run so you land *inside* the app,
  not on the login page:
  ```js
  // one-time: node login.mjs  → writes auth.json
  const ctx = await browser.newContext({ storageState: "auth.json", viewport:{width:1600,height:1000}, deviceScaleFactor:2 });
  ```
  (For OAuth/SSO you can't script blind, run headed once and persist `storageState`.)
- **Wait for *real content*, not just the network.** `networkidle` lies on SPAs. Wait for a selector that
  only exists once data has rendered: `await page.waitForSelector('[data-loaded], .result-row', { timeout: 30000 })`.
- **Kill loaders and motion** so you never freeze a spinner mid-spin:
  ```js
  await page.addStyleTag({ content: `*{animation:none!important;transition:none!important} .spinner,.skeleton{display:none!important}` });
  ```
- **Freeze dynamic/sensitive data** (timestamps, PII, random charts) by stubbing the API or editing the
  DOM before the shot, so the reel is stable and shareable.
- **Shoot crisp.** `deviceScaleFactor: 2` (retina); screenshot the element/region you'll actually frame,
  at the aspect ratio of your `.frame`, so it isn't stretched by `object-fit:cover`.

Save the PNGs next to the reel (e.g. `sizzle/shots/`) and reference them as `<img class="shot">`. The reel
stays fully offline and deterministic; the live app is never in the capture path.

### Non-web products (CLI, desktop, mobile)

The reel is always a web page, but **what it showcases doesn't have to be.** The animation half is
identical — you drop images or short clips into the same `.frame` + panel-by-panel + backdrop system.
Only the *sourcing* of the assets differs (native capture tools instead of Playwright). By product type:

- **CLI / terminal.** Two good paths:
  1. **Re-create the terminal in HTML and animate it deterministically** (preferred). Build a `.frame`
     styled as a terminal (mono font, prompt, dark bg) and type the command + stream the output the same
     way as the chat centerpiece (#3) — per-char/word opacity tweens + a `t`-driven caret. This is crisp
     at any resolution, fully seek-safe, and on-brand for a deterministic reel. No screenshot needed.
  2. **Script a real session with [VHS](https://github.com/charmbracelet/vhs)** (charmbracelet/vhs). A
     `.tape` file (`Type`, `Enter`, `Sleep`, `Set` for theme/font/speed, `Output`) renders a terminal
     session *deterministically* to a **PNG frame directory** (drop straight into `encode.mjs`) or to
     GIF/MP4/WebM (embed as a clip — see below). Great when you want the *actual* tool output, repeatable.
  3. Ad-hoc: a clean, high-DPI terminal **screenshot** (large font, trimmed prompt, secrets hidden) used
     as a `.shot` still, with a slow Ken Burns (#1) so it isn't dead.

- **Desktop app.** Stills: OS screenshot (Windows Snip / macOS `Cmd-Shift-4`), crop the window chrome you
  don't want, capture on a HiDPI/retina display for sharpness, scrub PII. Motion: a short, clean **screen
  recording** (OBS Studio, macOS Screen Recording, Windows Game Bar) trimmed to the *exact* beat — then
  either embed it as a clip (below) or `ffmpeg`-extract it to a PNG sequence and use the frames.

- **Mobile app.** Use the **iOS Simulator / Android Emulator** rather than a physical device: clean status
  bar, high-res output, no real PII, and you can seed demo data. Screenshot or screen-record the simulator;
  optionally composite inside a device-bezel mockup PNG instead of the flat `.frame`.

**Embedding a clip seek-safely.** If you bring in a `<video>` (from a screen recording or VHS MP4) rather
than stills, keep determinism: drive playback from the timeline instead of letting it free-run —
`video.currentTime = clamp((t - clipStartMs) / 1000, 0, video.duration)` inside `applyState(t)` — and have
the harness wait for the video's `canplaythrough` (and a `seeked` after the first seek) before setting
`window.__ready`, exactly like it waits for `.shot` images to decode. Otherwise headless capture grabs
black or stale-frame video. When in doubt, prefer a **PNG sequence** (VHS `--frames` or `ffmpeg`-extracted)
over a live `<video>` — frames are trivially seek-safe.

## 2. Sequential / panel-by-panel reveal (your favorite — and a 2025 best practice)

Don't pop a complex UI in all at once. Reveal it in pieces: **shell first, then columns, then rows,
then the payload/overlay.** Each piece is a short staggered tween. This lets the viewer's eye assemble
the interface and follow the story. (Material/Apple motion + 2025 demo guidance call this exact thing
"sequential reveal: shell → data → overlays.")

Pattern:
```js
const SA = 3.3;                                  // scene base time — slide the whole scene by 1 number
tl.to(frame,        {opacity:1,z:0,duration:1.1}, SA+0.3);   // 1. the window shell
tl.fromTo("#col",   {x:-30,opacity:0},{x:0,opacity:1,duration:0.7}, SA+0.6);  // 2. a column
tl.to("#title",     {opacity:1,duration:0.5}, SA+0.9);       // 3. header
tl.to("[data-row]", {opacity:1,duration:0.5,stagger:0.06}, SA+1.1);  // 4. rows, staggered
tl.to("#highlight", {opacity:1,scale:1,duration:0.5,ease:"back.out(1.7)"}, SA+1.9);  // 5. the payoff
```
Keys: anchor every sub-tween off one `SA` base; use `stagger` for lists; end on the *one* element that
is the point of the scene (the extracted entity, the matched row, the answer).

## 3. Animated chat / "Ask" centerpiece

The most engaging beat in our reel. Simulate a live conversation deterministically:
- Build a chat window (sidebar + transcript) the same way as a screenshot frame (#1).
- **Typing**: reveal a question with a clipped-width or per-character opacity tween + a blinking caret
  (a tween that toggles caret opacity — but keep it seek-safe: drive caret from `Math.sin`/step on `t`
  in `applyState`, not a `repeat:-1`).
- **Thinking**: 3 dots pulsing for ~1s (again, drive from `t`, not an infinite loop).
- **Answer**: stream the response in word-by-word (stagger opacity on `<span>`-wrapped words), then
  fade in a **citation chip** so it reads as *grounded*, not hallucinated.

This beat tells the product story better than any screenshot — invest the most time here.

## 4. Dramatize the mechanism (not just the result)

Make the *invisible* thing visible. Examples that landed well:
- A typed query **collapses to a point of light**, then **fires beams** into the 3D graph (retrieval).
- Four retriever traces **converge on a spinning fusion ring** (RRF / hybrid fusion).
- Raw text **resolves into entities + a schema** (extraction / inference).
- A question travels "through fiber" into a graph engine.

Built from SVG primitives (lines with `stroke-dashoffset` "draw-on", circles that bloom via `attr:{r}`)
over the brightened 3D backdrop. This is the antidote to "every RAG demo just shows chunk→embed→search":
show what your product does *beyond* that.

## 5. Two-mode rhythm (panel ↔ graph-forward)

Alternate dim-backdrop **panel** beats (legible narrative) with bright **graph-forward** beats (motion
in the 3D scene). The contrast is what separates this from a screen recording. Drive it from the `fx`
object: panel = `dim↓, scrim↑`; graph-forward = `dim=1, edgeGlow↑`, plus a camera move.

## 6. Camera as punctuation

Never leave the camera static. A slow continuous dolly/orbit (tween `camState.z`/`gy`) under everything
gives parallax and life. Push **in** for intimacy (chat/answer), pull **out** for the close/CTA.

---

## Motion principles (timing cheat-sheet)

Distilled from Material & Apple HIG motion guidance + 2025 software-demo practice. Defaults, not laws:

| Element | Duration / hold | Notes |
| --- | --- | --- |
| Title / short phrase | hold **2.5–3s** | long enough to read twice |
| Caption | ~**1.5s per word**, 3–5s total | break up anything tweet-length |
| UI element in/out | **300–500ms** | with easing, never linear |
| Full-screen transition | up to **700ms** | pick 1–2 transition styles, stay consistent |
| Feature highlight / beat | **2–5s** (sizzle), 5–8s (demo) | one idea per beat |
| Whole reel | **30–120s** | no dead air, but let key frames breathe |

Other rules that matter for a deterministic reel:
- **One idea per beat.** If you're explaining two things, it's two beats.
- **Ease everything** (`power2/power3`, `back.out` for "pop"). Linear motion reads robotic.
- **Text must linger even when motion is quick** — animate fast, hold the words.
- **Legibility:** captions over busy UI need a scrim/dim or a drop shadow; ≥ ~74px off the frame bottom.
- **Consistency:** reuse the same in/out style and the same 2-color accent across all beats.

Sources: Material Design Motion (material.io/design/motion), Apple HIG → Motion
(developer.apple.com/design/human-interface-guidelines/motion). Refresh these before a big project.

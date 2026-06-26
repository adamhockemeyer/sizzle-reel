# Scene Playbook

A proven structure for a ~30–60s product reel. The goal is *one message per beat*, paced so a viewer
grasps the product in a single watch. Pair a plain-English outcome line with a concrete technical anchor
in each scene — works for both engineer and stakeholder audiences.

## Arc (adapt to your product)

| # | Beat | Job | Visual mode |
| --- | --- | --- | --- |
| 1 | **Title / Hook** | Name + one-line promise ("Any document, no templates"). | Backdrop forms in from particles. |
| 2 | **Differentiator** | The thing competitors *don't* do. Animate the actual mechanism, not a screenshot. | Panel over dimmed backdrop. |
| 3 | **Ask / Chat** | Show the core interaction: a question typed, "thinking", a grounded answer with citations. | Panel; this is usually the most engaging beat — invest here. |
| 4 | **Core capability** | The signature technical move (retrieval fusion, graph traversal, schema inference…). | **Graph-forward**: backdrop brightens, motion happens *in* the 3D scene. |
| 5 | **Interfaces** | Where it lives (web, MCP, API, CLI) — quick pills/badges. | Brief, backdrop bright. |
| 6 | **Close / CTA** | Pull back, restate value, call to action. | Camera dollies out, backdrop blooms. |

Cut beats to hit your runtime budget. 4 strong beats beat 6 rushed ones.

## Ground it in a real scenario; close on the action

Two lessons that consistently raise the *credibility* of a reel, especially for B2B / enterprise subjects:

- **Pick a concrete, recognizable scenario, not a generic toy.** "Insurance claims triage" or "invoice
  approval" reads as a real workflow a buyer recognizes; "ask about the weather / plan a trip to Kyoto"
  reads as a sandbox. The scenario should thread through the whole reel (the chat, the graph, the
  captions), not just one beat. A reel that demonstrates *an outcome a stakeholder cares about* beats one
  that demonstrates *features* — sell the job-to-be-done, then show the mechanism that delivers it.
- **Close on the next action, not just a URL.** End on the literal thing a viewer would do next — the
  **install / get-started command** (`pip install …`, `npm create …`, `dotnet add package …`) — not only
  a repo/docs link. The command makes "I could try this in 30 seconds" feel true. Links can ride along
  underneath, but the command is the call-to-action.

For a **subject with no UI** (a library, API, protocol, framework — anything you can't screenshot),
you *assemble* the interface from primitives instead of capturing one: real code panels, a simulated
**live chat** (technique #3), provider/interop nodes, and an animated graph of *the thing the library
builds*. Make that built-artifact graph (e.g. a multi-agent workflow) a hero beat — it's the closest
thing to "showing the product." See `references/techniques.md` (#1 "No UI at all") and
`references/assets.md` for using real product icons so the assembled UI doesn't look generic.

## Two visual modes (the key rhythm)

Alternate between them so the reel breathes:

- **Panel mode** — dim the 3D backdrop (`fx.dim`, a `scrim`) and float a UI-like card/caption on top. Use
  for narrative beats (title, differentiator, chat). Keeps text legible.
- **Graph-forward mode** — brighten the backdrop, raise `edgeGlow`, move the camera, and run SVG/particle
  motion *in the scene itself*. Use for the signature-capability beat so it doesn't feel like a slideshow
  of screenshots. This contrast is what makes it feel cinematic vs. a screen recording.

## Animate the differentiator, not screenshots

The strongest beats dramatize the *mechanism*: a question collapsing to a point of light and firing
retriever beams into a graph; four traces converging on a spinning fusion ring; entities resolving out of
raw text into a schema. Screenshots are fine as texture, but the memorable moments are custom motion of
the idea. (This came directly from feedback: most RAG demos stop at "chunk, embed, search" — show what
*more* your product does.)

## Captions & tags

- **Lower caption** (`bottom: ≥74px`) — the value/outcome line for the beat. Fade in, hold, fade out;
  don't stack two at once.
- **Scene tag** (small, top or corner) — a one-word label for the capability ("INGEST", "RETRIEVAL",
  "GRAPH"). Orients the viewer.
- Keep lines short — a few words. They must read at README/thumbnail size.

## Timing conventions

- Build on the paused timeline at **absolute start times**. Anchor a scene's sub-tweens off one base
  constant (e.g. `const SB = 28.0; tl.to(..., SB+2.55)`) so you can slide a whole scene by editing one
  number.
- Let beats *overlap* at the seams — start the next camera move ~0.5s before the previous caption fully
  fades, so transitions feel continuous, not slidewise.
- Hold each caption long enough to read (~1.5–2.5s visible). Motion can be quick; **text must linger**.
- Budget: title ~3–4s, each content beat ~6–9s, close ~3–4s.

## State-object pattern

Drive everything off two plain objects tweened by GSAP and applied every frame in `applyState(t)`:
- `camState` — camera `x/y/z` + graph rotation offset `gy`. Tween for dollies/pans.
- `fx` — `form` (backdrop reveal 0→1), `dim` (backdrop brightness for panel mode), `scrim` (overlay
  opacity), `edgeGlow` (graph edge brightness), `bars` (letterbox), etc.

This keeps the 3D scene fully a function of the timeline, so any seek reproduces the exact frame.

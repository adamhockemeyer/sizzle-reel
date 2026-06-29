# Prompt

A representative prompt that drives the skill to produce this self-referential reel. The skill responds to
natural language — you don't need to phrase it exactly like this. The interesting part here is asking the
skill to make a reel **about itself** while deliberately *diverging* from the other examples so the set
shows range, not repetition.

---

> Make a cinematic sizzle reel **for the sizzle-reel skill itself**, for this repo's README.
>
> The subject is a **developer/CLI tool** that turns any repo into a deterministic README video
> (three.js + GSAP, captured headless with Playwright, encoded with ffmpeg). There's **no product UI** to
> screenshot — so *assemble* the interface: a re-created **streaming terminal** showing the capture running,
> and a literal **filmstrip** as the hero mechanism.
>
> Make it look **clearly different** from the other two example reels — I don't want three versions of the
> same thing. Push every axis: use a **warm cinematic palette** (amber/gold on charcoal, with a film-red REC
> accent) instead of cool cyan/violet, a **drifting-motes / film-dust backdrop** instead of a graph, and a
> **frames → film transformation** story instead of a card-and-chat tour.
>
> Lead with the **differentiator**: this is *not* a screen recording — show that idea getting struck out and
> a glowing **REC** pill taking over. Then make the **streaming terminal the first hero** (capture actions
> stream in, a progress bar fills, a caret blinks). Then make the **mechanism the climax**: captured frames
> fly onto a filmstrip, a **playhead sweeps across it like it's playing**, and it collapses into
> `sizzle.mp4` + `sizzle.gif`. Add a **built-on** beat with the real build-stack logos
> (**three.js · GSAP · Playwright · ffmpeg**) and the deterministic-render pillars. Close on the **install
> command**, not just a link.
>
> Use **real icons** for the build stack (permissively licensed — Simple Icons / the official Playwright
> logo), and keep the whole thing on the deterministic paused-seek harness so it renders identically every
> time. Output an MP4 plus a slim README GIF.

---

## Notes on what the skill did with this

- **Treated "look different" as a hard requirement.** Before authoring, it diffed against the two existing
  reels on a contrast table (subject / backdrop / palette / centerpiece / story / signature move) and chose
  a value on *every* axis the others didn't use — warm vs cool, motes vs graph, transformation vs tour.
  Showing range is the whole point of an examples folder. (See
  [`references/scene-playbook.md`](../../skills/sizzle-reel/references/scene-playbook.md).)
- **Assembled an interface for a tool with no UI.** A CLI tool can't be screenshotted, so the centerpiece is
  a *re-created* streaming terminal — action lines, a progress bar, a blinking caret, a spinner — that makes
  a build pipeline feel live. (Same "no product UI" move as the MAF example, executed in a different idiom.)
- **Made the mechanism the hero.** The literal filmstrip with a sweeping playhead — frames flying in, then
  collapsing into `.mp4` / `.gif` outputs — *is* what the skill does, so it's the climax beat, not a footnote.
- **Picked the backdrop from the subject.** Drifting light motes / film dust on charcoal, to evoke film
  flowing through a gate — deliberately not the graph backdrop the other reels use. (See
  [`references/backdrops.md`](../../skills/sizzle-reel/references/backdrops.md).)
- **Used real icons, carefully.** three.js / GSAP / ffmpeg as white monochrome via Simple Icons, and the
  official Playwright logo from playwright.dev — generic, permissively-licensed build-stack marks, with text
  labels as graceful fallback. (See [`references/assets.md`](../../skills/sizzle-reel/references/assets.md).)
- **Kept it deterministic.** Caret blink, spinner glyph, dust drift, and playhead position are all pure
  functions of time, so a cold seek reproduces the exact frame — the reel renders identically every run.
- **Closed on the action.** Ends on the install command, so the last thing on screen is the next thing to do.

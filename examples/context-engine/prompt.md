# Prompt

A representative prompt that drives the skill to produce a reel like the Context Engine example.
The skill responds to natural language — you don't need to phrase it exactly like this.

---

> Make a cinematic sizzle reel for this project for the README.
>
> It's a **context engine**: it ingests a codebase/knowledge base into a knowledge graph and
> answers questions over it with grounded, streamed responses. The differentiator is the live
> graph + schema awareness, not just vector search.
>
> Use a subtle animated knowledge-graph backdrop that fits the domain (don't make it loud), and
> build the scenes around the **real product screenshots** in `web/sizzle/screens/`
> (dashboard, schema, graph, the streamed answer). Arc it as: title → what makes it different →
> ask a question and stream the answer → reveal the schema → reveal the graph/dashboard → close.
>
> Render it deterministically to an MP4 plus a slim README GIF.

---

## Notes on what the skill did with this

- **Chose the backdrop from the product**, not a default — a graph motif because the product *is* a
  graph engine. (For a different product it would pick a different backdrop; see
  [`references/backdrops.md`](../../references/backdrops.md).)
- **Grounded every scene in real screenshots** captured once into `screens/`, composited into 3D
  frames — never a live, mid-auth app screen.
- **Animated the differentiator** (graph + streamed answer), not generic UI chrome.

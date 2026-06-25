# Example: Context Engine reel

A sizzle reel for a graph/RAG **"context engine"** — a product that ingests a codebase/knowledge
base and answers questions over a live knowledge graph.

| | |
| --- | --- |
| **Duration** | ~46s |
| **Backdrop** | Subtle animated neural / knowledge-graph nodes (fits the product's domain) |
| **Scenes** | Title → Differentiator → Ask/streamed-answer → Schema → Graph/dashboard reveal → Close |
| **Signature moves** | Real product screenshots composited into 3D frames, panel-by-panel reveal, animated chat streaming |

## Output

![Context Engine sizzle reel](context-engine.gif)

▶ Higher quality: [`context-engine.mp4`](context-engine.mp4)

## Prompt

See [`prompt.md`](prompt.md) for the kind of natural-language prompt that produces a reel like this.

## How it was rendered

```bash
node scripts/smoke.mjs   --dir <product>/web/sizzle
node scripts/capture.mjs --dir <product>/web/sizzle --fps 30 --w 1600 --h 900
node scripts/encode.mjs  --frames <product>/web/sizzle/frames --out . --name context-engine
```

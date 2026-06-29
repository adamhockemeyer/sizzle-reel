# Real Assets (icons, logos, marks)

Generic shapes (a circle labelled "Auth", a grey box labelled "DB") read as a *mockup*. Real product
icons read as a real integration. This applies to **every** reel, not just no-UI ones — the moment a beat
names concrete services/providers (an integrations strip, an auth provider, a cloud deploy target, the
model/data vendors you support), prefer the **actual icons**. Even a polished product UI gains from
recognizable third-party marks around it. It's the cheapest single upgrade from "generic" to "polished."

## Prefer real icons over labelled shapes

- Swap placeholder nodes for the vendor's official icon wherever a beat names a real product
  (a model provider, a cloud service, a protocol). Keep a short text label *next to* the icon — the
  icon gives recognition, the label gives certainty.
- Embed as inline SVG `<image>` (set **both** `href` and `xlink:href` for headless-Chromium safety) or
  as a `<img>`. Keep the files **local** to the reel (e.g. `examples/<name>/assets/`) so capture stays
  offline and deterministic — never hot-link an icon URL in the page you capture.
- Mind the canvas: many "dark" logos are black and vanish on a dark backdrop. Pick the **light/white**
  variant for dark scenes (and vice-versa). Verify on an actual captured frame, not just in the editor.

## Where to source official icons

Use first-party icon sets so marks are correct and current. Examples (look up the live source each time —
URLs and pack versions move):

- **Azure / Microsoft services** — the official Azure architecture icon set (search
  "Azure architecture icons" on learn.microsoft.com; it ships as a versioned `Azure_Public_Service_Icons`
  zip of per-service SVGs). Microsoft Fabric icons ship via the `@fabric-msft/svg-icons` npm package.
- **A protocol / open standard** — its own site or brand kit (e.g. the Model Context Protocol logo from
  the MCP site; pick the light vs dark variant to match your backdrop).
- **A third-party product** — that vendor's official brand/press kit, not a random PNG from search.
- **Generic tech (languages, DBs, clouds)** — community sets like Simple Icons / Devicon are fine for
  *neutral* tech marks, but prefer the first-party brand kit for any *named product*. The
  [Iconify](https://iconify.design) API/MCP is a convenient open-licensed aggregator (275k+ icons across
  Simple Icons, Devicon, Logos, etc.) for fetching these generic marks as SVG — but the **trademark caution
  below still applies**: Iconify hosting an icon does not grant brand-usage rights.

## Trademark caution (important for published repos)

Showing a logo can imply endorsement or partnership. For a reel that will live in a **public / corporate**
repo:

- It's fine to show the icon of a product you **are** (your own service) or are **demonstrably built on**.
- Be conservative with **competitor** logos. When in doubt, render competitors as **plain text wordmarks**
  (just the name, styled) rather than their logo — it still communicates breadth without an
  endorsement/trademark problem. (The MAF example does exactly this: real Azure + MCP icons, but rival
  model vendors are text-only.)
- Respect each vendor's brand guidelines (clear-space, don't recolor a wordmark, don't imply partnership).

> Rule of thumb: **icon for what you're proud to be associated with; text for everyone else.**

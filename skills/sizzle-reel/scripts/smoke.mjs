/**
 * Fast smoke test for a sizzle reel — seeks ~N representative beats, screenshots
 * each, and FAILS (exit 1) on any console.error or pageerror. Run this after every
 * tweak instead of a full ~10-minute capture.
 *
 * It also runs a LAYOUT AUDIT at every beat: it scans visible text for the three
 * ways text gets cut off in a finished reel —
 *   1. crosses-frame   — text extends past the 1600x900 capture edge (clipped by the frame)
 *   2. under-letterbox — text overlaps a cinematic letterbox bar (or any full-width opaque
 *                        bar anchored top/bottom) that paints over it
 *   3. clipped-box     — text is bigger than its own overflow:hidden/clip container
 *   4. near-edge       — text sits inside the safe margin (soft warning; --margin to tune)
 * Offenders are printed with the beat + a text snippet. Layout issues are warnings by
 * default; pass --strict to make crosses-frame / under-letterbox / clipped-box fail (exit 1).
 *
 * The page MUST expose window.__seek(ms), window.__duration, window.__ready.
 *
 * Beats are read from <sizzleDir>/beats.json if present (array of [label, ms]).
 * Otherwise it auto-samples ~16 evenly-spaced timestamps across __duration.
 *
 * Usage: node smoke.mjs --dir <sizzleDir> [--page index.html] [--out <smokeDir>]
 *                       [--margin 28] [--strict]
 * Env fallbacks: SIZZLE_DIR, SIZZLE_PAGE, SIZZLE_OUT
 */
import path from "node:path";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const SIZZLE_DIR = path.resolve(arg("dir", process.env.SIZZLE_DIR ?? "."));
const PAGE = arg("page", process.env.SIZZLE_PAGE ?? "index.html");
const OUT = path.resolve(arg("out", process.env.SIZZLE_OUT ?? path.join(SIZZLE_DIR, "smoke")));
const MARGIN = Number(arg("margin", "28"));
const STRICT = process.argv.includes("--strict");
await mkdir(OUT, { recursive: true });

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript",
  ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2",
};
const server = http.createServer(async (req, res) => {
  try {
    const rel = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.join(SIZZLE_DIR, rel === "/" ? `/${PAGE}` : rel);
    const buf = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(buf);
  } catch { res.writeHead(404); res.end("not found"); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
let errCount = 0;
page.on("pageerror", (e) => { errCount++; console.log("[pageerror]", e.message); });
page.on("console", (m) => { if (m.type() === "error") { errCount++; console.log("[console.error]", m.text()); } });

await page.goto(`${base}/${PAGE}?capture=1`, { waitUntil: "load", timeout: 60000 });
await page.waitForFunction("window.__ready === true", { timeout: 30000 });
const duration = await page.evaluate("window.__duration");
console.log("ready, duration =", duration);

// beats: from beats.json, else auto-sample
let beats;
try {
  beats = JSON.parse(await readFile(path.join(SIZZLE_DIR, "beats.json"), "utf8"));
} catch {
  const n = 16;
  beats = Array.from({ length: n }, (_, i) => {
    const ms = Math.round((i / (n - 1)) * duration * 1000);
    return [`beat-${String(i).padStart(2, "0")}`, ms];
  });
}

// Runs in the page at each beat. Returns text elements that are cut off / unsafe.
// Pure DOM measurement — deterministic, no screenshot diffing.
function auditLayout(margin) {
  const W = window.innerWidth, H = window.innerHeight;
  const visible = (el) => {
    // Effective opacity / visibility walking up to <body>: reels stack all scenes
    // and hide inactive ones via opacity, so we must skip those or every parked
    // beat reports false positives.
    let op = 1, node = el;
    while (node && node !== document.body) {
      const cs = getComputedStyle(node);
      if (cs.visibility === "hidden" || cs.display === "none") return 0;
      op *= parseFloat(cs.opacity || "1");
      if (op <= 0.05) return 0;
      node = node.parentElement;
    }
    return op;
  };
  // Occluders: full-width near-opaque bars anchored to the very top/bottom
  // (cinematic letterbox) that paint OVER content.
  const occluders = [];
  for (const el of document.querySelectorAll("body *")) {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    if (parseFloat(cs.opacity || "1") < 0.5) continue;
    const bg = cs.backgroundColor || "";
    const m = bg.match(/rgba?\(([^)]+)\)/);
    const alpha = m ? (m[1].split(",")[3] !== undefined ? parseFloat(m[1].split(",")[3]) : 1) : 0;
    if (alpha < 0.6) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= W * 0.98 && r.height > 1 && (r.top <= 2 || r.bottom >= H - 2)) {
      occluders.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
  }
  const issues = [];
  for (const el of document.querySelectorAll("body *")) {
    // direct text only (avoid double-counting container + leaf)
    let txt = "";
    for (const n of el.childNodes) if (n.nodeType === 3) txt += n.nodeValue;
    txt = txt.trim();
    if (!txt) continue;
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // intersection with canvas — fully-parked (off-canvas) elements are intentional, skip
    const onW = Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0));
    const onH = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
    if (onW <= 0 || onH <= 0) continue;
    const snippet = txt.replace(/\s+/g, " ").slice(0, 48);
    const at = `[${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}]`;
    const cs = getComputedStyle(el);
    const types = [];
    // 1) crosses the capture frame
    if (r.left < -0.5 || r.top < -0.5 || r.right > W + 0.5 || r.bottom > H + 0.5) types.push("crosses-frame");
    // 2) clipped inside its own overflow box
    const ox = cs.overflowX, oy = cs.overflowY;
    if (((ox === "hidden" || ox === "clip") && el.scrollWidth > el.clientWidth + 1) ||
        ((oy === "hidden" || oy === "clip") && el.scrollHeight > el.clientHeight + 1)) types.push("clipped-box");
    // 3) under a letterbox/occluder bar
    for (const o of occluders) {
      const ix = Math.min(r.right, o.right) - Math.max(r.left, o.left);
      const iy = Math.min(r.bottom, o.bottom) - Math.max(r.top, o.top);
      if (ix > 2 && iy > 2) { types.push("under-letterbox"); break; }
    }
    // 4) inside the safe margin but on-canvas (soft)
    if (!types.length && (r.left < margin || r.top < margin || r.right > W - margin || r.bottom > H - margin))
      types.push("near-edge");
    if (types.length) issues.push({ types, snippet, at });
  }
  return issues;
}

const HARD = new Set(["crosses-frame", "under-letterbox", "clipped-box"]);
let hardLayout = 0, softLayout = 0;
for (const [label, ms] of beats) {
  await page.evaluate((t) => new Promise((r) => { window.__seek(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), ms);
  await page.screenshot({ path: path.join(OUT, `${label}.png`) });
  const issues = await page.evaluate(auditLayout, MARGIN);
  if (issues.length) {
    console.log(`[layout] ${label} (${ms}ms): ${issues.length} issue(s)`);
    for (const it of issues) {
      const hard = it.types.some((t) => HARD.has(t));
      if (hard) hardLayout++; else softLayout++;
      console.log(`   ${hard ? "✗" : "·"} ${it.types.join("+")} ${it.at} "${it.snippet}"`);
    }
  }
  console.log("wrote", label, ms);
}

await browser.close();
server.close();
if (softLayout) console.log(`[layout] ${softLayout} near-edge warning(s) (within ${MARGIN}px safe margin)`);
if (hardLayout) console.log(`[layout] ${hardLayout} text element(s) CUT OFF (crosses-frame / under-letterbox / clipped-box)`);
const layoutFail = STRICT && hardLayout > 0;
const ok = errCount === 0 && !layoutFail;
console.log(ok
  ? (hardLayout ? `SMOKE OK — no console errors (but ${hardLayout} layout issue(s); run with --strict to gate)` : "SMOKE OK — no errors")
  : `SMOKE FAILED — ${errCount} console error(s)${layoutFail ? `, ${hardLayout} layout issue(s)` : ""}`);
process.exit(ok ? 0 : 1);

/**
 * Fast smoke test for a sizzle reel — seeks ~N representative beats, screenshots
 * each, and FAILS (exit 1) on any console.error or pageerror. Run this after every
 * tweak instead of a full ~10-minute capture.
 *
 * The page MUST expose window.__seek(ms), window.__duration, window.__ready.
 *
 * Beats are read from <sizzleDir>/beats.json if present (array of [label, ms]).
 * Otherwise it auto-samples ~16 evenly-spaced timestamps across __duration.
 *
 * Usage: node smoke.mjs --dir <sizzleDir> [--page index.html] [--out <smokeDir>]
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

for (const [label, ms] of beats) {
  await page.evaluate((t) => new Promise((r) => { window.__seek(t); requestAnimationFrame(() => requestAnimationFrame(r)); }), ms);
  await page.screenshot({ path: path.join(OUT, `${label}.png`) });
  console.log("wrote", label, ms);
}

await browser.close();
server.close();
console.log(errCount === 0 ? "SMOKE OK — no errors" : `SMOKE FAILED — ${errCount} errors`);
process.exit(errCount === 0 ? 0 : 1);

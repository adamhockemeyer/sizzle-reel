/**
 * Deterministic frame-by-frame capture of a standalone three.js + GSAP sizzle reel.
 *
 * Loads the page with ?capture=1 (so it does NOT run its own requestAnimationFrame
 * loop), waits for window.__ready, then steps a virtual clock frame-by-frame calling
 * window.__seek(ms) and screenshots each frame. Fully self-contained: no dev server,
 * no auth, no backend — which is exactly what makes the output reproducible.
 *
 * The page MUST expose: window.__seek(ms), window.__duration, window.__ready.
 *
 * Usage:
 *   node capture.mjs --dir <sizzleDir> [--page index.html] [--out <framesDir>]
 *                    [--fps 30] [--w 1600] [--h 900]
 * Env fallbacks: SIZZLE_DIR, SIZZLE_PAGE, SIZZLE_OUT, SIZZLE_FPS, SIZZLE_W, SIZZLE_H
 */
import { mkdir, rm, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const SIZZLE_DIR = path.resolve(arg("dir", process.env.SIZZLE_DIR ?? "."));
const PAGE = arg("page", process.env.SIZZLE_PAGE ?? "index.html");
const FRAMES_DIR = path.resolve(arg("out", process.env.SIZZLE_OUT ?? path.join(SIZZLE_DIR, "frames")));
const FPS = Number(arg("fps", process.env.SIZZLE_FPS ?? 30));
const WIDTH = Number(arg("w", process.env.SIZZLE_W ?? 1600));
const HEIGHT = Number(arg("h", process.env.SIZZLE_H ?? 900));

// fresh frames dir every run
await rm(FRAMES_DIR, { recursive: true, force: true });
await mkdir(FRAMES_DIR, { recursive: true });

// ephemeral static server (ES modules can't load over file:// due to CORS)
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
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--disable-gpu-vsync"],
});
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
const page = await context.newPage();
page.on("console", (m) => { if (m.type() === "error") console.log("  [page error]", m.text()); });

try {
  const url = `${base}/${PAGE}?capture=1`;
  console.log(`Loading ${url}`);
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  await page.waitForFunction("window.__ready === true", { timeout: 30000 });

  const duration = await page.evaluate("window.__duration");
  const totalFrames = Math.round(duration * FPS);
  console.log(`Ready. Duration=${duration}s  FPS=${FPS}  Frames=${totalFrames}  ${WIDTH}x${HEIGHT}`);

  for (let f = 0; f < totalFrames; f++) {
    const ms = (f / FPS) * 1000;
    // seek, then wait two animation frames so the GL buffer is composited
    await page.evaluate(
      (t) => new Promise((res) => { window.__seek(t); requestAnimationFrame(() => requestAnimationFrame(res)); }),
      ms,
    );
    await page.screenshot({ path: path.join(FRAMES_DIR, `frame_${String(f).padStart(5, "0")}.png`) });
    if (f % 30 === 0 || f === totalFrames - 1) process.stdout.write(`\r  captured ${f + 1}/${totalFrames}`);
  }
  process.stdout.write("\n");

  const written = (await readdir(FRAMES_DIR)).filter((n) => n.endsWith(".png"));
  console.log(`Frame capture complete: ${written.length} PNGs in ${FRAMES_DIR}`);
} finally {
  await browser.close();
  server.close();
}

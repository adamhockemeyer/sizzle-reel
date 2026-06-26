/**
 * Cross-platform encode (Windows / macOS / Linux): captured PNG frame sequence ->
 * MP4 + slim README-inline GIF (+ poster). Cross-platform so colleagues
 * on macOS/Linux don't need PowerShell. Resolves ffmpeg in this order:
 *   1. the `ffmpeg-static` npm package (recommended: `npm i -D ffmpeg-static`)
 *      gives every OS a full static build WITH libx264 and needs no system install
 *   2. ffmpeg on PATH (a system/Homebrew/apt/winget install)
 *   3. platform fallbacks (winget package dir; Playwright's bundled binary)
 * Each candidate is verified to actually have libx264 before use — Playwright's
 * bundled ffmpeg is a minimal build that usually LACKS libx264 and cannot encode
 * our MP4, so it is skipped rather than failing mid-encode.
 *
 * Usage:
 *   node encode.mjs --frames <framesDir> --out <outDir> [--name my-reel] [--fps 30]
 *                   [--sync <readmeMediaDir>]
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import os from "node:os";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const FRAMES = path.resolve(arg("frames", "frames"));
const OUT = path.resolve(arg("out", "out"));
const NAME = arg("name", "sizzle");
const FPS = arg("fps", "30");
const SYNC = arg("sync", "");

if (!existsSync(path.join(FRAMES, "frame_00000.png"))) {
  console.error(`No frames found in ${FRAMES}. Run capture.mjs first.`);
  process.exit(1);
}
const frameCount = readdirSync(FRAMES).filter((n) => /^frame_\d+\.png$/.test(n)).length;
console.log(`Found ${frameCount} frames at ${FPS}fps.`);

// --- resolve ffmpeg (ffmpeg-static -> PATH -> platform fallbacks), verifying libx264 ---
function onPath(bin) {
  const r = spawnSync(bin, ["-version"], { stdio: "ignore" });
  return r.status === 0;
}
function hasLibx264(bin) {
  const r = spawnSync(bin, ["-hide_banner", "-encoders"], { encoding: "utf8" });
  return r.status === 0 && /\blibx264\b/.test(r.stdout || "");
}
function findUnder(dir, matcher) {
  if (!existsSync(dir)) return null;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (matcher(e.name)) return full;
    }
  }
  return null;
}
async function ffmpegStaticPath() {
  // Optional: only present if the user ran `npm i -D ffmpeg-static`. Never a hard dep.
  // Resolve from the user's project (cwd) first, since this script lives in the skill
  // dir which has no node_modules. Bare `import()` resolves relative to THIS file, so
  // it only works when NODE_PATH points at the project — try cwd via createRequire too.
  const tryStr = (p) => (typeof p === "string" && existsSync(p) ? p : null);
  try {
    const reqCwd = createRequire(path.join(process.cwd(), "package.json"));
    const p = tryStr(reqCwd("ffmpeg-static"));
    if (p) return p;
  } catch { /* not installed in cwd project */ }
  try {
    const mod = await import("ffmpeg-static");
    return tryStr(mod.default || mod);
  } catch {
    return null;
  }
}
async function resolveFfmpeg() {
  const candidates = [];
  const staticPath = await ffmpegStaticPath();
  if (staticPath) candidates.push(staticPath);
  if (onPath("ffmpeg")) candidates.push("ffmpeg");
  const home = os.homedir();
  if (process.platform === "win32") {
    const w = findUnder(path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages"), (n) => n === "ffmpeg.exe");
    if (w) candidates.push(w);
    const pw = findUnder(path.join(process.env.LOCALAPPDATA || "", "ms-playwright"), (n) => n === "ffmpeg-win64.exe");
    if (pw) candidates.push(pw);
  } else {
    const cache = process.platform === "darwin"
      ? path.join(home, "Library", "Caches", "ms-playwright")
      : path.join(home, ".cache", "ms-playwright");
    const pw = findUnder(cache, (n) => n === "ffmpeg-mac" || n === "ffmpeg-linux");
    if (pw) candidates.push(pw);
  }
  // Prefer the first candidate that can actually encode H.264.
  for (const c of candidates) {
    if (hasLibx264(c)) return c;
    console.warn(`Skipping ${c} (no libx264 encoder).`);
  }
  return null;
}
const ffmpeg = await resolveFfmpeg();
if (!ffmpeg) {
  console.error("No libx264-capable ffmpeg found. Easiest fix: `npm i -D ffmpeg-static` (no system install needed). Or install ffmpeg via winget/brew/apt.");
  process.exit(1);
}
console.log(`Using ffmpeg: ${ffmpeg}`);

function run(args) {
  const r = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (r.status !== 0) { console.error(`ffmpeg failed: ${args.join(" ")}`); process.exit(1); }
}

mkdirSync(OUT, { recursive: true });
const frameGlob = path.join(FRAMES, "frame_%05d.png");
const mp4 = path.join(OUT, `${NAME}.mp4`);
const gif = path.join(OUT, `${NAME}.gif`);
const palette = path.join(OUT, `${NAME}-palette.png`);
const poster = path.join(OUT, `${NAME}-poster.png`);

console.log("Encoding MP4...");
run(["-y", "-framerate", FPS, "-i", frameGlob, "-c:v", "libx264", "-preset", "slow",
  "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4]);

console.log("Building GIF palette...");
run(["-y", "-framerate", FPS, "-i", frameGlob,
  "-vf", "fps=10,scale=600:-1:flags=lanczos,palettegen=max_colors=144", palette]);

console.log("Encoding GIF...");
run(["-y", "-framerate", FPS, "-i", frameGlob, "-i", palette,
  "-lavfi", "fps=10,scale=600:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5",
  "-loop", "0", gif]);

// poster = representative mid-timeline frame (~62%)
const midIdx = Math.floor(frameCount * 0.62);
const midFrame = path.join(FRAMES, `frame_${String(midIdx).padStart(5, "0")}.png`);
if (existsSync(midFrame)) copyFileSync(midFrame, poster);

if (SYNC) {
  mkdirSync(path.resolve(SYNC), { recursive: true });
  copyFileSync(mp4, path.join(path.resolve(SYNC), `${NAME}.mp4`));
  copyFileSync(gif, path.join(path.resolve(SYNC), `${NAME}.gif`));
}

const mb = (p) => (statSync(p).size / 1048576).toFixed(1) + " MB";
console.log(`\nDone.`);
console.log(` - MP4: ${mp4} (${mb(mp4)})`);
console.log(` - GIF: ${gif} (${mb(gif)})`);
console.log(` - Poster: ${poster} (mid frame ${midIdx}/${frameCount})`);
if (SYNC) console.log(`Synced to ${SYNC}.`);
if (statSync(gif).size > 9 * 1048576) {
  console.log("WARN: GIF > 9 MB — lower fps/scale or trim duration for README inlining.");
}

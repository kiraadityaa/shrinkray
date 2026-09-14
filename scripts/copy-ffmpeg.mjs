// Copies FFmpeg-WASM core files into public/ so they are served
// same-origin (required under COOP/COEP require-corp).
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

function copyPkg(pkg, candidates) {
  const dest = join(root, "public", "ffmpeg", pkg.replace("@ffmpeg/", ""));
  mkdirSync(dest, { recursive: true });
  let copied = 0;
  for (const rel of candidates) {
    const src = join(root, "node_modules", pkg, rel);
    if (existsSync(src)) {
      cpSync(src, join(dest, rel.split("/").pop()));
      copied++;
    }
  }
  if (copied === 0) throw new Error(`no files found for ${pkg}`);
  console.log(`copied ${pkg} (${copied} files) -> ${dest}`);
}

const layouts = ["dist/umd/ffmpeg-core.js", "dist/umd/ffmpeg-core.wasm", "dist/umd/ffmpeg-core.worker.js", "dist/ffmpeg-core.js", "dist/ffmpeg-core.wasm", "dist/ffmpeg-core.worker.js"];

for (const pkg of ["@ffmpeg/core-mt", "@ffmpeg/core-st"]) {
  try {
    copyPkg(pkg, layouts);
  } catch (e) {
    console.warn(`${pkg} copy skipped (fallback uses CDN):`, e.message);
  }
}

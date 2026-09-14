// Singleton FFmpeg-WASM loader with multithread -> single-thread fallback.
// Core files are copied to /ffmpeg/* by `npm run copy:ffmpeg` (same-origin,
// required under COOP/COEP). CDN is the fallback when local files are missing.
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let instance: FFmpeg | null = null;
let mode: "mt" | "st" | null = null;
let loading: Promise<{ ffmpeg: FFmpeg; mode: "mt" | "st" }> | null = null;

export type LoadProgress = (pct: number) => void;

async function blobOrUrl(path: string, mime: string): Promise<string> {
  try {
    const res = await fetch(path, { method: "HEAD" });
    if (res.ok) return toBlobURL(path, mime) as Promise<string>;
  } catch {
    // fall through to CDN
  }
  return path;
}

async function tryLoad(core: "core-mt" | "core-st", onProgress?: LoadProgress) {
  const ffmpeg = new FFmpeg();
  const localBase = `/ffmpeg/${core}`;
  const cdnBase =
    core === "core-mt"
      ? `https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/umd`
      : `https://unpkg.com/@ffmpeg/core-st@0.11.1/dist`;
  let base = cdnBase;
  try {
    const probe = await fetch(`${localBase}/ffmpeg-core.js`, { method: "HEAD" });
    if (probe.ok) base = localBase;
  } catch {
    base = cdnBase;
  }
  ffmpeg.on("progress", ({ progress }: { progress: number }) => onProgress?.(Math.round(progress * 100)));
  await ffmpeg.load({
    coreURL: await blobOrUrl(`${base}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await blobOrUrl(`${base}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await blobOrUrl(`${base}/ffmpeg-core.worker.js`, "text/javascript"),
  });
  return ffmpeg;
}

export function loadFFmpeg(onProgress?: LoadProgress): Promise<{ ffmpeg: FFmpeg; mode: "mt" | "st" }> {
  if (instance && mode) return Promise.resolve({ ffmpeg: instance, mode });
  if (loading) return loading;
  loading = (async () => {
    // Multithread first (needs SharedArrayBuffer + COOP/COEP headers).
    try {
      if (typeof SharedArrayBuffer !== "undefined") {
        const ffmpeg = await tryLoad("core-mt", onProgress);
        instance = ffmpeg;
        mode = "mt";
        return { ffmpeg, mode };
      }
    } catch (e) {
      console.warn("core-mt failed, falling back to core-st:", e);
    }
    const ffmpeg = await tryLoad("core-st", onProgress);
    instance = ffmpeg;
    mode = "st";
    return { ffmpeg, mode };
  })();
  return loading;
}

export function isWasmSupported(): boolean {
  return typeof WebAssembly !== "undefined" && typeof Worker !== "undefined";
}

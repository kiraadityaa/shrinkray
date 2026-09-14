// Runs the actual encode with the loaded FFmpeg-WASM instance.
// Kept separate from React so it can be unit-tested and moved to a
// Web Worker later without touching the UI.
import { fetchFile } from "@ffmpeg/util";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import type { EncodePlan } from "./plan";

export interface EncodeEvents {
  onProgress?: (pct: number) => void;
}

const IN = "input";
const OUT = "output.mp4";

function inputName(original: string): string {
  const ext = original.split(".").pop()?.toLowerCase() ?? "mp4";
  return `${IN}.${["mp4", "mov", "mkv", "webm", "m4v"].includes(ext) ? ext : "mp4"}`;
}

export async function runEncode(
  ffmpeg: FFmpeg,
  file: File,
  plan: EncodePlan,
  events: EncodeEvents = {},
): Promise<Blob> {
  const name = inputName(file.name);
  await ffmpeg.writeFile(name, await fetchFile(file));
  ffmpeg.on("progress", ({ progress }: { progress: number }) => {
    events.onProgress?.(Math.min(99, Math.max(0, Math.round(progress * 100))));
  });
  await ffmpeg.exec(["-y", "-i", name, ...plan.args, OUT]);
  const data = await ffmpeg.readFile(OUT);
  await ffmpeg.deleteFile(name).catch(() => {});
  await ffmpeg.deleteFile(OUT).catch(() => {});
  const bytes = data as Uint8Array;
  // Copy out of WASM memory (avoids SharedArrayBuffer detach issues).
  return new Blob([bytes.slice().buffer as ArrayBuffer], { type: "video/mp4" });
}

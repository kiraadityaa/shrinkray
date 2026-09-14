// Client-side metadata probe: no ffprobe binary in the browser,
// so we read what <video> + File API can tell us reliably.
import type { SourceMeta } from "./plan";

export async function probeFile(file: File): Promise<SourceMeta> {
  const { width, height, fps, durationSec, hasAudio } = await probeVideoElement(file);
  return {
    width,
    height,
    fps,
    durationSec,
    sizeBytes: file.size,
    hasAudio,
    codec: undefined, // unknown client-side; planner treats it conservatively
  };
}

function probeVideoElement(file: File): Promise<{ width: number; height: number; fps: number; durationSec: number; hasAudio: boolean }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.muted = true;
    const cleanup = () => URL.revokeObjectURL(url);
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Could not read video metadata (timeout)."));
    }, 15_000);
    el.onloadedmetadata = () => {
      window.clearTimeout(timer);
      // //webkitAudioDecodedByteCount / mozHasAudio are non-standard; best-effort.
      const anyEl = el as HTMLVideoElement & { mozHasAudio?: boolean; webkitAudioDecodedByteCount?: number };
      const hasAudio =
        anyEl.mozHasAudio === true ||
        (typeof anyEl.webkitAudioDecodedByteCount === "number" && anyEl.webkitAudioDecodedByteCount > 0) ||
        true; // assume audio present; encoder drops it harmlessly if absent
      const meta = {
        width: el.videoWidth || 1280,
        height: el.videoHeight || 720,
        fps: 30, // <video> can't report fps; planner preserves caps per preset
        durationSec: Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0,
        hasAudio,
      };
      cleanup();
      resolve(meta);
    };
    el.onerror = () => {
      window.clearTimeout(timer);
      cleanup();
      reject(new Error("This file could not be decoded by your browser. Try an MP4 (H.264)."));
    };
    el.src = url;
  });
}

// Adaptive encoding planner — port of adjust-quality's
// lib/video/recommendation.ts, made client-safe (no node deps)
// and preset-aware (target file size per messenger).
//
// Priorities: resolution > fps > color > visual quality > file size.
// Never upscales, never invents fps, never invents color tags.

import type { Preset } from "./presets";

export interface SourceMeta {
  width: number;
  height: number;
  fps: number;
  durationSec: number;
  sizeBytes: number;
  hasAudio: boolean;
  /** e.g. "h264" when known, undefined otherwise. */
  codec?: string;
}

export interface EncodePlan {
  width: number;
  height: number;
  fps: number;
  fpsCapped: boolean;
  crf: number;
  /** bits/sec cap used as -maxrate. */
  videoBitrate: number;
  scaleFilter?: string;
  preset: string;
  notes: string[];
  /** ffmpeg argv fragment (without -i / output). */
  args: string[];
  estimatedBytes: number;
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

function bitrateCapFor(width: number, height: number, fps: number): number {
  const pixels = width * height;
  if (pixels >= 1_000_000) return fps > 32 ? 8_000_000 : 5_000_000;
  if (pixels >= 600_000) return 3_000_000;
  return 1_500_000;
}

/** Rough size estimate: (video cap + 128k audio) * duration * 0.7 (CRF efficiency). */
export function estimateBytes(plan: Pick<EncodePlan, "videoBitrate">, durationSec: number, hasAudio: boolean): number {
  const audio = hasAudio ? 128_000 : 0;
  return Math.round(((plan.videoBitrate + audio) * durationSec) / 8 * 0.7);
}

export function planEncode(src: SourceMeta, preset: Preset, attempt = 0): EncodePlan {
  const notes: string[] = [];
  const longSide = Math.max(src.width, src.height);
  let width = src.width;
  let height = src.height;
  let scaleFilter: string | undefined;

  // Attempt > 0 means the estimate still exceeds target: shrink harder.
  const longSideCap = attempt >= 2 ? Math.min(preset.maxLongSide, 960) : attempt >= 1 ? Math.min(preset.maxLongSide, 1280) : preset.maxLongSide;

  if (longSide > longSideCap) {
    const scale = longSideCap / longSide;
    width = even(src.width * scale);
    height = even(src.height * scale);
    scaleFilter = `scale=${width}:${height}:flags=lanczos`;
    notes.push(`Downscaled ${src.width}x${src.height} → ${width}x${height} (long-side cap ${longSideCap}px).`);
  } else {
    notes.push(`Resolution preserved at ${width}x${height}.`);
  }

  let fps = src.fps > 0 ? src.fps : 30;
  let fpsCapped = false;
  if (fps > preset.maxFps) {
    notes.push(`FPS capped ${fps} → ${preset.maxFps} for ${preset.label}.`);
    fps = preset.maxFps;
    fpsCapped = true;
  } else {
    notes.push(`FPS preserved at ${fps}.`);
  }

  // CRF climbs with each retry: base, base+3, base+6 (max 32).
  const crf = Math.min(32, preset.baseCrf + attempt * 3);
  if (attempt > 0) notes.push(`Retry #${attempt}: CRF raised to ${crf} to hit ${formatBytes(preset.maxBytes)} target.`);

  let cap = bitrateCapFor(width, height, fps);
  // Squeeze the maxrate on retries so -maxrate enforces the target.
  if (attempt > 0 && src.durationSec > 0) {
    const targetAvg = Math.floor(((preset.maxBytes * 8) / src.durationSec) * 0.85);
    cap = Math.max(400_000, Math.min(cap, targetAvg));
    notes.push(`Bitrate cap squeezed to ${(cap / 1_000_000).toFixed(2)} Mbps for target size.`);
  }

  const args = buildArgs({ width, height, fps, fpsCapped, crf, videoBitrate: cap, scaleFilter, hasAudio: src.hasAudio });
  const estimatedBytes = estimateBytes({ videoBitrate: cap }, src.durationSec, src.hasAudio);

  return { width, height, fps, fpsCapped, crf, videoBitrate: cap, scaleFilter, preset: "veryfast", notes, args, estimatedBytes };
}

/** Pick the first attempt (0..2) whose estimate fits the preset target. */
export function planForTarget(src: SourceMeta, preset: Preset): EncodePlan {
  for (let attempt = 0; attempt < 3; attempt++) {
    const plan = planEncode(src, preset, attempt);
    if (plan.estimatedBytes <= preset.maxBytes || attempt === 2) return plan;
  }
  return planEncode(src, preset, 2);
}

function buildArgs(o: { width: number; height: number; fps: number; fpsCapped: boolean; crf: number; videoBitrate: number; scaleFilter?: string; hasAudio: boolean }): string[] {
  const a = ["-c:v", "libx264", "-preset", "veryfast", "-crf", String(o.crf)];
  a.push("-maxrate", String(o.videoBitrate), "-bufsize", String(o.videoBitrate * 2));
  a.push("-pix_fmt", "yuv420p");
  if (o.scaleFilter) a.push("-vf", o.scaleFilter);
  if (o.fpsCapped) a.push("-r", String(o.fps));
  a.push("-profile:v", "high", "-level", "4.0");
  if (o.hasAudio) a.push("-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2");
  else a.push("-an");
  a.push("-movflags", "+faststart");
  return a;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export const LIMITS = {
  desktopMaxBytes: 500 * 1024 * 1024,
  mobileMaxBytes: 200 * 1024 * 1024,
  allowedExtensions: ["mp4", "mov", "mkv", "webm", "m4v"],
} as const;

export function validateFile(name: string, size: number, isMobile: boolean): string | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!(LIMITS.allowedExtensions as readonly string[]).includes(ext)) return `Extension .${ext} not supported. Use MP4, MOV, MKV, WebM, or M4V.`;
  const max = isMobile ? LIMITS.mobileMaxBytes : LIMITS.desktopMaxBytes;
  if (size > max) return `File is ${formatBytes(size)} — limit is ${formatBytes(max)} on ${isMobile ? "mobile" : "desktop"}. Try a shorter clip.`;
  return null;
}

import { describe, expect, it } from "vitest";
import { PRESETS, getPreset } from "@/lib/presets";
import { estimateBytes, formatBytes, planEncode, planForTarget, validateFile } from "@/lib/plan";

describe("presets", () => {
  it("has 5 global messenger presets", () => {
    expect(PRESETS).toHaveLength(5);
    expect(getPreset("discord-free").maxBytes).toBe(10 * 1024 * 1024);
  });
  it("falls back to first preset for unknown slug", () => {
    expect(getPreset("nope").slug).toBe("discord-free");
  });
});

describe("planEncode", () => {
  it("never upscales small sources", () => {
    const plan = planEncode(
      { width: 640, height: 480, fps: 30, durationSec: 10, sizeBytes: 5_000_000, hasAudio: true },
      getPreset("discord-free"),
    );
    expect(plan.width).toBe(640);
    expect(plan.height).toBe(480);
    expect(plan.scaleFilter).toBeUndefined();
  });
  it("downscales 4K to preset cap", () => {
    const plan = planEncode(
      { width: 3840, height: 2160, fps: 60, durationSec: 30, sizeBytes: 500_000_000, hasAudio: true },
      getPreset("discord-free"),
    );
    expect(Math.max(plan.width, plan.height)).toBeLessThanOrEqual(1280);
    expect(plan.fps).toBe(30);
    expect(plan.fpsCapped).toBe(true);
  });
  it("raises CRF on retry attempts", () => {
    const base = planEncode(
      { width: 1920, height: 1080, fps: 30, durationSec: 60, sizeBytes: 200_000_000, hasAudio: true },
      getPreset("discord-free"),
      0,
    );
    const retry = planEncode(
      { width: 1920, height: 1080, fps: 30, durationSec: 60, sizeBytes: 200_000_000, hasAudio: true },
      getPreset("discord-free"),
      2,
    );
    expect(retry.crf).toBeGreaterThan(base.crf);
  });
  it("planForTarget fits discord-free estimate", () => {
    const plan = planForTarget(
      { width: 1920, height: 1080, fps: 30, durationSec: 20, sizeBytes: 100_000_000, hasAudio: true },
      getPreset("discord-free"),
    );
    expect(plan.estimatedBytes).toBeLessThanOrEqual(getPreset("discord-free").maxBytes);
  });
  it("emits faststart + aac args", () => {
    const plan = planEncode(
      { width: 1280, height: 720, fps: 30, durationSec: 10, sizeBytes: 20_000_000, hasAudio: true },
      getPreset("telegram"),
    );
    expect(plan.args).toContain("+faststart");
    expect(plan.args).toContain("aac");
  });
});

describe("helpers", () => {
  it("estimateBytes scales with duration", () => {
    const a = estimateBytes({ videoBitrate: 3_000_000 }, 10, true);
    const b = estimateBytes({ videoBitrate: 3_000_000 }, 20, true);
    expect(b).toBeGreaterThan(a);
  });
  it("formatBytes renders MB", () => {
    expect(formatBytes(10 * 1024 * 1024)).toBe("10.0 MB");
  });
  it("validateFile rejects bad extension and oversize", () => {
    expect(validateFile("clip.avi", 1000, false)).toMatch(/not supported/);
    expect(validateFile("clip.mp4", 600 * 1024 * 1024, false)).toMatch(/limit/);
    expect(validateFile("clip.mp4", 1000, false)).toBeNull();
  });
});

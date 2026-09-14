"use client";

import { useCallback, useRef, useState } from "react";
import { PRESETS } from "@/lib/presets";
import { formatBytes, planForTarget, validateFile, type EncodePlan, type SourceMeta } from "@/lib/plan";
import { probeFile } from "@/lib/analyze-client";
import { isWasmSupported, loadFFmpeg } from "@/lib/wasm-loader";
import { runEncode } from "@/lib/encode";

type Stage = "idle" | "probing" | "loading-engine" | "encoding" | "done" | "error";

export default function Compressor({ initialPreset = "discord-free" }: { initialPreset?: string }) {
  const [presetSlug, setPresetSlug] = useState(initialPreset);
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [meta, setMeta] = useState<SourceMeta | null>(null);
  const [plan, setPlan] = useState<EncodePlan | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const preset = PRESETS.find((p) => p.slug === presetSlug) ?? PRESETS[0];
  const isMobile = typeof navigator !== "undefined" && /android|iphone|ipad/i.test(navigator.userAgent);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setResultUrl(null);
      setProgress(0);
      const invalid = validateFile(file.name, file.size, isMobile);
      if (invalid) {
        setStage("error");
        setError(invalid);
        return;
      }
      if (!isWasmSupported()) {
        setStage("error");
        setError("This browser does not support WebAssembly Workers. Try latest Chrome, Edge, or Firefox on desktop.");
        return;
      }
      try {
        setStage("probing");
        setFileName(file.name);
        setStatusLine("Reading video metadata…");
        const probed = await probeFile(file);
        setMeta(probed);
        const p = planForTarget(probed, preset);
        setPlan(p);

        setStage("loading-engine");
        setStatusLine("Loading FFmpeg engine (one-time, ~30MB)…");
        const { ffmpeg, mode } = await loadFFmpeg((pct) => setProgress(pct));
        setStatusLine(mode === "mt" ? "Engine ready (multithread)." : "Engine ready (single-thread fallback).");

        setStage("encoding");
        setStatusLine(`Compressing to ${preset.label} target ${formatBytes(preset.maxBytes)}…`);
        setProgress(0);
        const t0 = performance.now();
        const blob = await runEncode(ffmpeg, file, p, { onProgress: setProgress });
        const dt = ((performance.now() - t0) / 1000).toFixed(1);
        setResultBytes(blob.size);
        setResultUrl(URL.createObjectURL(blob));
        setProgress(100);
        setStage("done");
        setStatusLine(`Done in ${dt}s — saved ${Math.max(0, Math.round((1 - blob.size / file.size) * 100))}%.`);
      } catch (e) {
        setStage("error");
        setError(e instanceof Error ? e.message : "Compression failed. Try an MP4 (H.264) or a shorter clip.");
      }
    },
    [preset, isMobile],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Preset picker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {PRESETS.map((p) => (
          <button
            key={p.slug}
            onClick={() => setPresetSlug(p.slug)}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
              p.slug === presetSlug
                ? "border-emerald-500 bg-emerald-500/10 font-semibold"
                : "border-black/[.08] dark:border-white/[.145] hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            }`}
          >
            <div>{p.label}</div>
            <div className="text-xs opacity-60">{p.maxBytes >= 1024 * 1024 * 1024 ? `${(p.maxBytes / 1024 / 1024 / 1024).toFixed(1)} GB` : formatBytes(p.maxBytes)}</div>
          </button>
        ))}
      </div>
      <p className="text-sm opacity-70 mb-4">{preset.tagline}</p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-black/[.12] dark:border-white/[.2] p-10 text-center hover:border-emerald-500 transition"
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.mkv,.webm,.m4v"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
        <div className="text-4xl mb-2">🎬</div>
        <div className="font-medium">Drop a video here or click to browse</div>
        <div className="text-sm opacity-60 mt-1">MP4 · MOV · MKV · WebM · M4V — max {isMobile ? "200MB mobile" : "500MB desktop"}</div>
        <div className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          🔒 No upload — your file never leaves this device
        </div>
      </div>

      {/* Status */}
      {stage !== "idle" && (
        <div className="mt-6 rounded-2xl border border-black/[.08] dark:border-white/[.145] p-5 text-sm">
          <div className="font-medium truncate">
            {fileName} {meta && <span className="opacity-60">· {meta.width}x{meta.height} · {meta.durationSec ? `${meta.durationSec.toFixed(1)}s` : "live"}</span>}
          </div>
          {plan && (
            <div className="mt-2 opacity-80">
              Plan: {plan.width}x{plan.height} @ {plan.fps}fps · CRF {plan.crf} · est. {formatBytes(plan.estimatedBytes)}
              <ul className="list-disc ml-5 mt-1">
                {plan.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          {(stage === "probing" || stage === "loading-engine" || stage === "encoding") && (
            <div className="mt-4">
              <div className="h-2 rounded-full bg-black/[.06] dark:bg-white/[.1] overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${stage === "encoding" ? progress : stage === "loading-engine" ? Math.max(progress, 5) : 15}%` }} />
              </div>
              <div className="mt-2 opacity-70">
                {statusLine} {stage === "encoding" && `${progress}%`}
              </div>
            </div>
          )}
          {stage === "done" && resultUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href={resultUrl} download={`shrinkray-${preset.slug}-${fileName.replace(/\.[^.]+$/, "") || "video"}.mp4`} className="rounded-full bg-emerald-600 text-white px-5 py-2.5 font-medium hover:bg-emerald-500">
                ⬇ Download MP4 ({formatBytes(resultBytes)})
              </a>
              <span className="opacity-70">{statusLine}</span>
            </div>
          )}
          {stage === "error" && error && <div className="mt-3 text-red-600 dark:text-red-400 font-medium">⚠ {error}</div>}
        </div>
      )}
    </div>
  );
}

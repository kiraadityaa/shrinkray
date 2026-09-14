"use client";

import { useCallback, useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { PRESETS } from "@/lib/presets";
import { formatBytes, planForTarget, validateFile, type EncodePlan, type SourceMeta } from "@/lib/plan";
import { probeFile } from "@/lib/analyze-client";
import { isWasmSupported, loadFFmpeg } from "@/lib/wasm-loader";
import { runEncode } from "@/lib/encode";
import PresetRail from "./compressor/PresetRail";
import Dropzone from "./compressor/Dropzone";
import PlanReadout from "./compressor/PlanReadout";
import EncodeProgress from "./compressor/EncodeProgress";
import ResultPanel from "./compressor/ResultPanel";
import type { Stage } from "./compressor/types";

export default function Compressor({ initialPreset = "discord-free" }: { initialPreset?: string }) {
  const [presetSlug, setPresetSlug] = useState(initialPreset);
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [meta, setMeta] = useState<SourceMeta | null>(null);
  const [plan, setPlan] = useState<EncodePlan | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusLine, setStatusLine] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBytes, setResultBytes] = useState(0);
  const [elapsed, setElapsed] = useState("");
  const [error, setError] = useState<string | null>(null);

  const preset = PRESETS.find((p) => p.slug === presetSlug) ?? PRESETS[0];
  const isMobile = typeof navigator !== "undefined" && /android|iphone|ipad/i.test(navigator.userAgent);
  const busy = stage === "probing" || stage === "loading-engine" || stage === "encoding";

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setStage("idle");
    setFile(null);
    setFileName("");
    setMeta(null);
    setPlan(null);
    setProgress(0);
    setStatusLine("");
    setResultUrl(null);
    setResultBytes(0);
    setElapsed("");
    setError(null);
  }, [resultUrl]);

  const handleFile = useCallback(
    async (next: File) => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setError(null);
      setResultUrl(null);
      setProgress(0);
      const invalid = validateFile(next.name, next.size, isMobile);
      if (invalid) {
        setStage("error");
        setError(invalid);
        return;
      }
      if (!isWasmSupported()) {
        setStage("error");
        setError("This browser does not support WebAssembly workers. Try the latest Chrome, Edge, or Firefox on desktop.");
        return;
      }
      try {
        setStage("probing");
        setFile(next);
        setFileName(next.name);
        setStatusLine("Reading video metadata…");
        const probed = await probeFile(next);
        setMeta(probed);
        const p = planForTarget(probed, preset);
        setPlan(p);

        setStage("loading-engine");
        setStatusLine("Loading FFmpeg engine (one-time download, about 30 MB)…");
        const { ffmpeg, mode } = await loadFFmpeg((pct) => setProgress(pct));
        setStatusLine(mode === "mt" ? "Engine ready (multithread)." : "Engine ready (single-thread fallback).");

        setStage("encoding");
        setStatusLine(`Compressing for ${preset.label} — target ${formatBytes(preset.maxBytes)}…`);
        setProgress(0);
        const t0 = performance.now();
        const blob = await runEncode(ffmpeg, next, p, { onProgress: setProgress });
        setElapsed(`${((performance.now() - t0) / 1000).toFixed(1)}s`);
        setResultBytes(blob.size);
        setResultUrl(URL.createObjectURL(blob));
        setProgress(100);
        setStage("done");
        setStatusLine("");
      } catch (e) {
        setStage("error");
        setError(e instanceof Error ? e.message : "Compression failed. Try an MP4 (H.264) or a shorter clip.");
      }
    },
    [preset, isMobile, resultUrl],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ctp-subtext0">1 · Pick a target</h2>
        <PresetRail value={presetSlug} onChange={setPresetSlug} />
      </div>
      <div className="lg:col-span-3">
        <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ctp-subtext0">2 · Drop & download</h2>
        <Dropzone onFile={(f) => void handleFile(f)} busy={busy} isMobile={isMobile} />
        {(meta && plan) && (
          <div className="mt-4">
            <PlanReadout fileName={fileName} meta={meta} plan={plan} />
          </div>
        )}
        {(stage === "probing" || stage === "loading-engine" || stage === "encoding") && (
          <div className="mt-4">
            <EncodeProgress stage={stage} progress={progress} statusLine={statusLine} />
          </div>
        )}
        {stage === "done" && resultUrl && file && (
          <div className="mt-4">
            <ResultPanel
              url={resultUrl}
              fileName={fileName}
              presetSlug={preset.slug}
              resultBytes={resultBytes}
              originalBytes={file.size}
              elapsed={elapsed}
              onReset={reset}
            />
          </div>
        )}
        {stage === "error" && error && (
          <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-2xl border border-ctp-red/40 bg-ctp-red/10 p-4 text-sm">
            <WarningCircle size={18} weight="fill" aria-hidden className="mt-0.5 shrink-0 text-ctp-red" />
            <div>
              <p className="font-semibold text-ctp-red">Something went wrong</p>
              <p className="mt-0.5 text-ctp-subtext1">{error}</p>
              <button onClick={reset} className="mt-2 font-mono text-xs text-ctp-mauve hover:underline">
                ← try another file
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

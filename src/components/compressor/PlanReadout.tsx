"use client";

import { CaretDown, FileVideo } from "@phosphor-icons/react";
import { formatBytes, type EncodePlan, type SourceMeta } from "@/lib/plan";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <dt className="text-xs text-ctp-subtext0">{k}</dt>
      <dd className="text-right font-mono text-[13px] font-medium tabular-nums">{v}</dd>
    </div>
  );
}

export default function PlanReadout({
  fileName,
  meta,
  plan,
}: {
  fileName: string;
  meta: SourceMeta;
  plan: EncodePlan;
}) {
  return (
    <section aria-label="Encoding plan" className="rounded-2xl border border-ctp-surface0 bg-ctp-mantle p-4 sm:p-5">
      <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
        <FileVideo size={18} weight="duotone" aria-hidden className="shrink-0 text-ctp-mauve" />
        <span className="truncate">{fileName}</span>
      </p>
      <p className="mt-0.5 font-mono text-xs text-ctp-subtext0">
        {meta.width}x{meta.height}
        {meta.durationSec > 0 ? ` · ${meta.durationSec.toFixed(1)}s` : ""} · {formatBytes(meta.sizeBytes)}
      </p>
      <dl className="mt-2 divide-y divide-ctp-surface0">
        <Row k="Output" v={`${plan.width}x${plan.height} @ ${plan.fps}fps`} />
        <Row k="Video" v={`h264 · crf ${plan.crf} · ≤${(plan.videoBitrate / 1_000_000).toFixed(1)}mbps`} />
        <Row k="Audio" v={plan.args.includes("-an") ? "dropped · no source track" : "aac · 128k · 48khz"} />
        <Row k="Estimate" v={`≈ ${formatBytes(plan.estimatedBytes)}`} />
      </dl>
      {plan.notes.length > 0 && (
        <details className="group mt-2 text-xs text-ctp-subtext0">
          <summary className="flex cursor-pointer list-none items-center gap-1 transition hover:text-ctp-text">
            <CaretDown size={12} aria-hidden className="transition group-open:rotate-180" />
            Why these settings ({plan.notes.length})
          </summary>
          <ul className="mt-1.5 space-y-1 border-l-2 border-ctp-surface1 pl-3">
            {plan.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

"use client";

import { CheckCircle, CircleNotch } from "@phosphor-icons/react";
import type { Stage } from "./types";

const STEPS: { key: Stage; label: string }[] = [
  { key: "probing", label: "Probe" },
  { key: "loading-engine", label: "Engine" },
  { key: "encoding", label: "Encode" },
];

const ORDER: Stage[] = ["idle", "probing", "loading-engine", "encoding", "done", "error"];

function stepState(step: Stage, stage: Stage): "done" | "active" | "todo" {
  if (stage === "done") return "done";
  if (stage === "error") return step === "encoding" ? "active" : ORDER.indexOf(step) < ORDER.indexOf("encoding") ? "done" : "todo";
  if (ORDER.indexOf(stage) > ORDER.indexOf(step)) return "done";
  if (stage === step) return "active";
  return "todo";
}

export default function EncodeProgress({
  stage,
  progress,
  statusLine,
}: {
  stage: Stage;
  progress: number;
  statusLine: string;
}) {
  const pct = stage === "encoding" ? progress : stage === "loading-engine" ? Math.max(progress, 5) : 12;
  const indeterminate = stage === "probing";

  return (
    <section aria-label="Compression progress" aria-live="polite" className="rounded-2xl border border-ctp-surface0 bg-ctp-mantle p-4 sm:p-5">
      <ol className="flex items-center gap-1.5">
        {STEPS.map((s, i) => {
          const st = stepState(s.key, stage);
          return (
            <li key={s.key} className="flex min-w-0 flex-1 items-center gap-1.5">
              {i > 0 && <span aria-hidden className={`h-px flex-1 ${st !== "todo" ? "bg-ctp-mauve/50" : "bg-ctp-surface1"}`} />}
              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${
                  st === "done"
                    ? "text-ctp-green"
                    : st === "active"
                      ? "bg-ctp-mauve/15 text-ctp-mauve"
                      : "text-ctp-overlay0"
                }`}
              >
                {st === "done" ? (
                  <CheckCircle size={14} weight="fill" aria-hidden />
                ) : st === "active" && !indeterminate ? (
                  <CircleNotch size={14} aria-hidden className="animate-spin" />
                ) : null}
                {s.label}
              </span>
            </li>
          );
        })}
        <li className="shrink-0 font-mono text-sm font-bold tabular-nums text-ctp-mauve">{indeterminate ? "…" : `${pct}%`}</li>
      </ol>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ctp-surface0" role="progressbar" aria-valuenow={indeterminate ? undefined : pct} aria-valuemin={0} aria-valuemax={100} aria-label={statusLine}>
        {indeterminate ? (
          <div className="shrinkray-shimmer h-full w-2/5 rounded-full bg-ctp-mauve" />
        ) : (
          <div className="h-full rounded-full bg-ctp-mauve transition-[width]" style={{ width: `${pct}%` }} />
        )}
      </div>
      <p className="mt-2 text-[13px] text-ctp-subtext0">{statusLine}</p>
    </section>
  );
}

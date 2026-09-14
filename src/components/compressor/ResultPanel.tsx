"use client";

import { ArrowCounterClockwise, DownloadSimple } from "@phosphor-icons/react";
import { formatBytes } from "@/lib/plan";

export default function ResultPanel({
  url,
  fileName,
  presetSlug,
  resultBytes,
  originalBytes,
  elapsed,
  onReset,
}: {
  url: string;
  fileName: string;
  presetSlug: string;
  resultBytes: number;
  originalBytes: number;
  elapsed: string;
  onReset: () => void;
}) {
  const saved = Math.max(0, Math.round((1 - resultBytes / originalBytes) * 100));
  const stem = fileName.replace(/\.[^.]+$/, "") || "video";

  return (
    <section aria-label="Compression result" className="overflow-hidden rounded-2xl border border-ctp-green/30 bg-ctp-mantle">
      <div className="flex flex-wrap items-end justify-between gap-4 p-4 sm:p-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ctp-green">Ready to send</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums tracking-tight">
            {formatBytes(resultBytes)}
            <span className="ml-2 align-middle text-sm font-semibold text-ctp-green">−{saved}%</span>
          </p>
          <p className="mt-1 font-mono text-xs text-ctp-subtext0">
            {formatBytes(originalBytes)} → {formatBytes(resultBytes)} · mp4 h264+aac · {elapsed}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={url}
            download={`shrinkray-${presetSlug}-${stem}.mp4`}
            className="inline-flex items-center gap-2 rounded-full bg-ctp-mauve px-5 py-2.5 text-sm font-semibold text-ctp-base transition hover:brightness-110 active:scale-[0.98]"
          >
            <DownloadSimple size={16} weight="bold" aria-hidden />
            Download MP4
          </a>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-ctp-surface1 px-4 py-2.5 text-sm font-medium text-ctp-subtext1 transition hover:border-ctp-mauve/50 hover:text-ctp-text active:scale-[0.98]"
          >
            <ArrowCounterClockwise size={16} aria-hidden />
            New file
          </button>
        </div>
      </div>
    </section>
  );
}

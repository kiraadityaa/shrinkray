"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { PRESETS, formatPresetSize } from "@/lib/presets";

export default function PresetRail({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Compression target" className="flex flex-col gap-1">
      {PRESETS.map((p) => {
        const active = p.slug === value;
        return (
          <button
            key={p.slug}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(p.slug)}
            className={`group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition active:scale-[0.99] ${
              active
                ? "border-ctp-mauve bg-ctp-mauve/10"
                : "border-ctp-surface0 bg-ctp-mantle hover:border-ctp-surface1 hover:bg-ctp-surface0/40"
            }`}
          >
            <span
              aria-hidden
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                active ? "border-ctp-mauve text-ctp-mauve" : "border-ctp-surface2 text-transparent"
              }`}
            >
              <CheckCircle size={14} weight="fill" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className={`text-sm font-semibold ${active ? "text-ctp-text" : ""}`}>{p.label}</span>
                <span className="font-mono text-xs text-ctp-mauve">{formatPresetSize(p)}</span>
              </span>
              <span className="block truncate text-xs text-ctp-subtext0">{p.tagline}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

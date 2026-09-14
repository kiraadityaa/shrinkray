"use client";

import { useState } from "react";
import Link from "next/link";
import { FilmReel, GithubLogo, List, X } from "@phosphor-icons/react";
import { PRESETS } from "@/lib/presets";
import FlavourSwitcher from "./FlavourSwitcher";

const SHORT_LABELS: Record<string, string> = {
  "discord-free": "Discord",
  "discord-nitro": "Nitro",
  "whatsapp-status": "WhatsApp",
  telegram: "Telegram",
  "x-twitter": "X",
};

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="shrinkray-translucent sticky top-0 z-40 border-b border-ctp-surface0 bg-ctp-mantle/85 backdrop-blur-md">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ctp-mauve text-ctp-base">
            <FilmReel size={18} weight="fill" aria-hidden />
          </span>
          <span className="font-mono text-base font-bold tracking-tight">
            shrinkray<span className="text-ctp-mauve">_</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
          {PRESETS.map((p) => (
            <Link
              key={p.slug}
              href={`/tools/${p.slug}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[13px] text-ctp-subtext0 transition hover:bg-ctp-surface0 hover:text-ctp-text"
            >
              {SHORT_LABELS[p.slug] ?? p.label}
            </Link>
          ))}
        </div>
        <div className="hidden flex-1 lg:block" />

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <FlavourSwitcher />
          <a
            href="https://github.com/kiraadityaa/shrinkray"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ShrinkRay on GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ctp-subtext0 transition hover:bg-ctp-surface0 hover:text-ctp-text active:scale-[0.97]"
          >
            <GithubLogo size={20} aria-hidden />
          </a>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-ctp-subtext0 transition hover:bg-ctp-surface0 hover:text-ctp-text lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden /> : <List size={20} aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <nav aria-label="Tools" className="border-t border-ctp-surface0 px-4 py-2 lg:hidden">
          {PRESETS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/tools/${p.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-ctp-surface0 active:scale-[0.99]"
            >
              <span className="font-mono text-xs text-ctp-mauve">0{i + 1}</span>
              <span className="text-sm font-medium">{p.label}</span>
              <span className="ml-auto font-mono text-xs text-ctp-subtext0">{p.tagline.split("—")[0]}</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

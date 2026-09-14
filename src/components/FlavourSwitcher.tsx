"use client";

import { useEffect, useState } from "react";
import { Monitor, Sun, Moon } from "@phosphor-icons/react";
import { applyFlavour, getStoredFlavour, type Flavour, type ResolvedFlavour } from "@/lib/theme";

const OPTIONS: { value: Flavour; label: string; Icon: typeof Monitor }[] = [
  { value: "auto", label: "Auto", Icon: Monitor },
  { value: "latte", label: "Latte", Icon: Sun },
  { value: "mocha", label: "Mocha", Icon: Moon },
];

export default function FlavourSwitcher() {
  const [flavour, setFlavour] = useState<Flavour>("auto");
  const [resolved, setResolved] = useState<ResolvedFlavour>("mocha");

  useEffect(() => {
    const stored = getStoredFlavour();
    setFlavour(stored);
    setResolved(applyFlavour(stored));
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredFlavour() === "auto") setResolved(applyFlavour("auto"));
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const pick = (next: Flavour) => {
    setFlavour(next);
    window.localStorage.setItem("shrinkray-flavour", next);
    setResolved(applyFlavour(next));
  };

  return (
    <div
      role="radiogroup"
      aria-label="Color flavour"
      className="flex items-center gap-0.5 rounded-full border border-ctp-surface1 bg-ctp-mantle p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = flavour === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            title={`${label}${value === "auto" ? ` (system: ${resolved})` : ""}`}
            onClick={() => pick(value)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition active:scale-[0.97] ${
              active ? "bg-ctp-mauve text-ctp-base" : "text-ctp-subtext0 hover:text-ctp-text"
            }`}
          >
            <Icon size={14} weight={active ? "fill" : "regular"} aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

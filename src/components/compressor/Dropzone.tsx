"use client";

import { useRef, useState } from "react";
import { FilmStrip, LockKey } from "@phosphor-icons/react";

export default function Dropzone({
  onFile,
  busy,
  isMobile,
}: {
  onFile: (file: File) => void;
  busy: boolean;
  isMobile: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const dragCount = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Drop a video file here or press Enter to browse"
      aria-disabled={busy}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        dragCount.current += 1;
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCount.current = Math.max(0, dragCount.current - 1);
        if (dragCount.current === 0) setDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCount.current = 0;
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !busy) onFile(f);
      }}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
        dragging
          ? "border-ctp-mauve bg-ctp-mauve/10"
          : "border-ctp-surface1 bg-ctp-mantle hover:border-ctp-mauve/60 hover:bg-ctp-surface0/30"
      } ${busy ? "pointer-events-none opacity-70" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.mkv,.webm,.m4v"
        className="hidden"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition ${
          dragging ? "bg-ctp-mauve text-ctp-base" : "bg-ctp-surface0 text-ctp-mauve"
        }`}
      >
        <FilmStrip size={28} weight="duotone" aria-hidden />
      </span>
      <p className="mt-4 text-base font-semibold">
        {dragging ? "Release to compress" : "Drop a video here or browse files"}
      </p>
      <p className="mt-1 font-mono text-xs text-ctp-subtext0">
        mp4 · mov · mkv · webm · m4v — max {isMobile ? "200mb mobile" : "500mb desktop"}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ctp-mauve">
        <LockKey size={14} weight="bold" aria-hidden />
        No upload — your file never leaves this device
      </p>
    </div>
  );
}

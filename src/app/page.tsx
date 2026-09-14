import Compressor from "@/components/Compressor";
import { PRESETS } from "@/lib/presets";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <header className="max-w-5xl mx-auto px-6 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1">
          ✦ 100% client-side · FFmpeg-WASM
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold mt-4 tracking-tight">
          Shrink videos for Discord,<br className="hidden sm:block" /> without uploading them.
        </h1>
        <p className="mt-4 text-base sm:text-lg opacity-70 max-w-2xl mx-auto">
          ShrinkRay compresses video to {PRESETS.map((p) => p.label).join(" · ")} limits right in your
          browser. No server, no signup, no watermark — your file never leaves your device.
        </p>
      </header>

      <main className="px-6 pb-10">
        <Compressor />
      </main>

      <section className="max-w-3xl mx-auto px-6 pb-16 grid sm:grid-cols-3 gap-4 text-sm">
        {[
          ["🔒", "Private by design", "Encoding runs locally via WebAssembly. Close the tab and nothing remains."],
          ["⚡", "Adaptive quality", "CRF + bitrate caps tuned per resolution — ported from a proven FFmpeg engine."],
          ["💸", "Free forever", "No server bills means no paywall. Static hosting on Vercel free tier."],
        ].map(([icon, title, body]) => (
          <div key={title} className="rounded-2xl border border-black/[.08] dark:border-white/[.145] p-4">
            <div className="text-2xl">{icon}</div>
            <div className="font-semibold mt-1">{title}</div>
            <div className="opacity-70 mt-1">{body}</div>
          </div>
        ))}
      </section>

      <footer className="border-t border-black/[.08] dark:border-white/[.145] py-6 text-center text-sm opacity-60">
        ShrinkRay · MIT · Built with Next.js + FFmpeg-WASM · Files never leave your browser
      </footer>
    </div>
  );
}

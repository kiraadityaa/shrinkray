import Link from "next/link";
import { ArrowDown, ArrowRight, Cpu, LockKey, Lightning } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import Compressor from "@/components/Compressor";
import { PRESETS, formatPresetSize } from "@/lib/presets";

const STEPS = [
  { n: "01", title: "Drop a file", body: "MP4, MOV, MKV, WebM or M4V up to 500 MB on desktop. It stays on your machine." },
  { n: "02", title: "Pick a target", body: "Discord, Nitro, WhatsApp, Telegram or X. The planner tunes CRF and bitrate caps per preset." },
  { n: "03", title: "Download the MP4", body: "H.264 + AAC with faststart, validated against the size limit before you get the link." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Intro — left-aligned, tool-first */}
        <div className="grid gap-8 pt-12 pb-10 sm:pt-16 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-ctp-mauve/30 bg-ctp-mauve/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ctp-mauve">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ctp-mauve" />
              local-first · ffmpeg-wasm
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tighter sm:text-5xl lg:text-6xl">
              Shrink videos for Discord. Upload nothing.
            </h1>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-ctp-subtext1">
              ShrinkRay compresses video to messenger limits right in your browser. No server, no signup, no watermark.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#tool"
                className="inline-flex items-center gap-2 rounded-full bg-ctp-mauve px-6 py-3 text-sm font-semibold text-ctp-base transition hover:brightness-110 active:scale-[0.98]"
              >
                Compress a video
                <ArrowDown size={16} weight="bold" aria-hidden />
              </a>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ctp-subtext0">
                <LockKey size={14} aria-hidden />
                0 bytes uploaded
              </span>
            </div>
          </div>

          {/* Live specimen — real preset data, mono readout */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-ctp-surface0 bg-ctp-mantle">
              <div className="flex items-center gap-1.5 border-b border-ctp-surface0 px-4 py-2.5">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ctp-red/70" />
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ctp-yellow/70" />
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-ctp-green/70" />
                <span className="ml-2 font-mono text-xs text-ctp-subtext0">shrinkray — targets</span>
              </div>
              <dl className="divide-y divide-ctp-surface0 px-4">
                {PRESETS.map((p) => (
                  <div key={p.slug} className="flex items-baseline justify-between gap-3 py-2">
                    <dt className="font-mono text-[13px] text-ctp-subtext1">{p.slug}</dt>
                    <dd className="font-mono text-[13px] font-semibold tabular-nums text-ctp-mauve">
                      ≤{formatPresetSize(p)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="border-t border-ctp-surface0 px-4 py-2.5 font-mono text-[11px] text-ctp-subtext0">
                engine: ffmpeg-wasm mt → st fallback · out: h264 + aac
              </p>
            </div>
          </div>
        </div>

        {/* Tool */}
        <section id="tool" aria-label="Video compressor" className="scroll-mt-20 pb-16">
          <Compressor />
        </section>

        {/* How it works — numbered rows, not cards */}
        <section aria-label="How it works" className="border-t border-ctp-surface0 py-12">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Three steps, zero uploads</h2>
          </Reveal>
          <ol className="mt-6 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.07}>
                <li className="border-t-2 border-ctp-mauve/40 pt-4">
                  <p className="font-mono text-xs text-ctp-mauve">{s.n}</p>
                  <h3 className="mt-1 text-lg font-bold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ctp-subtext1">{s.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <p className="flex items-start gap-2.5 rounded-2xl border border-ctp-surface0 bg-ctp-mantle p-4">
              <Cpu size={20} aria-hidden className="mt-0.5 shrink-0 text-ctp-mauve" />
              <span className="text-ctp-subtext1">
                Encoding runs on your device via WebAssembly. Multithread when your browser allows it, single-thread
                fallback otherwise.
              </span>
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl border border-ctp-surface0 bg-ctp-mantle p-4">
              <Lightning size={20} aria-hidden className="mt-0.5 shrink-0 text-ctp-mauve" />
              <span className="text-ctp-subtext1">
                The planner never upscales and caps frame rates per target, then retries with higher CRF until the
                estimate fits the limit.
              </span>
            </p>
          </div>
        </section>

        {/* Preset index — asymmetric rows */}
        <section aria-label="Compression targets" className="border-t border-ctp-surface0 py-12">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Pick your battlefield</h2>
              <p className="font-mono text-xs text-ctp-subtext0">5 targets · dedicated pages</p>
            </div>
          </Reveal>
          <ul className="mt-4 divide-y divide-ctp-surface0 border-y border-ctp-surface0">
            {PRESETS.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/tools/${p.slug}`}
                  className="group flex items-center gap-4 py-4 transition hover:bg-ctp-surface0/30 sm:gap-6 sm:px-2"
                >
                  <span className="font-mono text-sm text-ctp-mauve">0{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold tracking-tight group-hover:text-ctp-mauve sm:text-lg">
                      {p.label}
                    </span>
                    <span className="block truncate text-sm text-ctp-subtext0">{p.tagline}</span>
                  </span>
                  <span className="hidden font-mono text-sm tabular-nums text-ctp-subtext1 sm:block">
                    ≤{formatPresetSize(p)}
                  </span>
                  <ArrowRight
                    size={18}
                    aria-hidden
                    className="shrink-0 text-ctp-subtext0 transition group-hover:translate-x-1 group-hover:text-ctp-mauve"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Compat strip */}
        <section aria-label="Formats and limits" className="pb-14">
          <p className="overflow-x-auto whitespace-nowrap rounded-2xl border border-ctp-surface0 bg-ctp-mantle px-4 py-3 text-center font-mono text-xs text-ctp-subtext1">
            in: mp4 · mov · mkv · webm · m4v <span aria-hidden className="text-ctp-mauve">→</span> out: h264 + aac
            faststart <span aria-hidden className="text-ctp-mauve">·</span> limit: 500mb desktop / 200mb mobile
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

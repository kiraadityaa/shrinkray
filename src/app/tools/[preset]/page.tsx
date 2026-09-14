import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import Compressor from "@/components/Compressor";
import { PRESETS, formatPresetSize, getPreset } from "@/lib/presets";

export async function generateStaticParams() {
  return PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ preset: string }> }): Promise<Metadata> {
  const { preset: slug } = await params;
  const p = getPreset(slug);
  return {
    title: `${p.label} Video Compressor — ${p.tagline} | ShrinkRay`,
    description: `Free ${p.label} video compressor online. ${p.tagline}. 100% in-browser, no upload, no signup.`,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ preset: string }> }) {
  const { preset: slug } = await params;
  const p = getPreset(slug);
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="pt-10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ctp-subtext0 transition hover:text-ctp-mauve"
          >
            <ArrowLeft size={14} aria-hidden />
            shrinkray_
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tighter sm:text-4xl">{p.label} Video Compressor</h1>
          <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ctp-subtext1">
            {p.tagline}. Free, no signup — encoded on your device, never uploaded.{" "}
            <span className="font-mono text-ctp-mauve">≤{formatPresetSize(p)}</span>
          </p>
        </div>
        <Compressor initialPreset={p.slug} />
      </main>
      <SiteFooter />
    </div>
  );
}

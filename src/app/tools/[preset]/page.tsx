import type { Metadata } from "next";
import Link from "next/link";
import Compressor from "@/components/Compressor";
import { PRESETS, getPreset } from "@/lib/presets";

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
    <div className="min-h-screen font-sans">
      <header className="max-w-3xl mx-auto px-6 pt-10 pb-4">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← ShrinkRay</Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-2">{p.label} Video Compressor</h1>
        <p className="opacity-70 mt-2">{p.tagline}. Free, no signup — your file never leaves your device.</p>
      </header>
      <main className="px-6 pb-16">
        <Compressor initialPreset={p.slug} />
      </main>
    </div>
  );
}

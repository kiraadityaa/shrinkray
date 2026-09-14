import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FLAVOUR_KEY } from "@/lib/theme";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShrinkRay — Compress video for Discord, WhatsApp & Telegram in your browser",
  description:
    "Free privacy-first video compressor. Shrink videos to Discord 10MB, WhatsApp Status, Telegram limits — 100% client-side with FFmpeg-WASM. No upload, no signup.",
  keywords: ["video compressor", "discord 10mb", "whatsapp status", "ffmpeg wasm", "compress video online", "no upload"],
  openGraph: {
    title: "ShrinkRay — video compressor that never uploads",
    description: "Drop a video, pick Discord / WA / Telegram, download the shrunk MP4. Your file never leaves your device.",
    type: "website",
  },
};

// Runs before hydration so the correct Catppuccin flavour is painted
// on the very first frame (no light/dark flash). `?flavour=latte|mocha`
// wins for shareable preview links, then the stored choice, then the OS.
const flavourBootstrap = `(function(){try{var q=new URLSearchParams(location.search).get('flavour');var s=localStorage.getItem('${FLAVOUR_KEY}');var r=(q==='latte'||q==='mocha')?q:((s==='latte'||s==='mocha')?s:(matchMedia('(prefers-color-scheme: dark)').matches?'mocha':'latte'));if(q==='latte'||q==='mocha')localStorage.setItem('${FLAVOUR_KEY}',q);document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r==='mocha'?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: flavourBootstrap }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}

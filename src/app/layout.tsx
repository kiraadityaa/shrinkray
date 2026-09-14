import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}

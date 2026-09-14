export interface Preset {
  slug: string;
  label: string;
  tagline: string;
  /** Hard target size in bytes. */
  maxBytes: number;
  /** Long-side cap in px (downscale only if larger). */
  maxLongSide: number;
  maxFps: number;
  /** Starting CRF per attempt; we raise it on retry. */
  baseCrf: number;
}

export const PRESETS: Preset[] = [
  {
    slug: "discord-free",
    label: "Discord Free",
    tagline: "≤10 MB — 720p, 30fps, fits free upload limit",
    maxBytes: 10 * 1024 * 1024,
    maxLongSide: 1280,
    maxFps: 30,
    baseCrf: 24,
  },
  {
    slug: "discord-nitro",
    label: "Discord Nitro",
    tagline: "≤25 MB — 1080p, 60fps",
    maxBytes: 25 * 1024 * 1024,
    maxLongSide: 1920,
    maxFps: 60,
    baseCrf: 21,
  },
  {
    slug: "whatsapp-status",
    label: "WhatsApp Status",
    tagline: "~15 MB / 30s — 720×1280 portrait friendly",
    maxBytes: 15 * 1024 * 1024,
    maxLongSide: 1280,
    maxFps: 30,
    baseCrf: 22,
  },
  {
    slug: "telegram",
    label: "Telegram",
    tagline: "≤50 MB — 1080p preserved",
    maxBytes: 50 * 1024 * 1024,
    maxLongSide: 1920,
    maxFps: 60,
    baseCrf: 20,
  },
  {
    slug: "x-twitter",
    label: "X / Twitter",
    tagline: "≤512 MB — minimal re-encode, faststart",
    maxBytes: 512 * 1024 * 1024,
    maxLongSide: 1920,
    maxFps: 60,
    baseCrf: 20,
  },
];

export function getPreset(slug: string): Preset {
  return PRESETS.find((p) => p.slug === slug) ?? PRESETS[0];
}

# ShrinkRay

Compress video for **Discord / WhatsApp / Telegram / X** — 100% in your browser.
No upload, no signup, no watermark. Your file never leaves your device.

Built with Next.js 15 + FFmpeg-WASM. The adaptive CRF planning engine is ported
from [adjust-quality](https://github.com/kiraadityaa/adjust-quality) (server-side FFmpeg)
and reworked for client-side encoding.

## Why

Messenger upload limits (Discord 10MB free, Telegram 50MB, WA Status…) force people
to upload private videos to random converter sites. ShrinkRay encodes locally via
WebAssembly instead — private by design, free to host (static, no GPU/server bills).

## Quick start

Requirements: Node.js ≥ 20.

```bash
git clone https://github.com/kiraadityaa/shrinkray.git
cd shrinkray
npm install
npm run copy:ffmpeg   # serve FFmpeg cores same-origin (needed for COOP/COEP)
npm run dev           # http://localhost:3000
```

## How it works

```
Drop video → probe metadata (<video> element) → plan CRF/bitrate per preset
→ load FFmpeg-WASM (multithread, single-thread fallback) → encode locally
→ download MP4 (H.264 + AAC, +faststart)
```

- `src/lib/presets.ts` — 5 messenger targets (Discord Free/Nitro, WA Status, Telegram, X)
- `src/lib/plan.ts` — adaptive planner: never upscales, caps fps per preset, retries with higher CRF until the size estimate fits
- `src/lib/analyze-client.ts` — browser metadata probe (no ffprobe binary client-side)
- `src/lib/wasm-loader.ts` — singleton loader: local `/ffmpeg/*` → CDN fallback, `core-mt` → `core-st`
- `src/lib/encode.ts` — runs the encode, reports progress, returns a Blob
- `src/components/Compressor.tsx` — the whole UI state machine
- `src/app/tools/[preset]/page.tsx` — SEO landing per preset

FFmpeg multithreading needs `SharedArrayBuffer`, hence the COOP/COEP headers
in `next.config.ts` + `vercel.json`. Safari/iOS falls back to single-thread.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest unit tests (planner, presets, validation) |
| `npm run lint` | ESLint |
| `npm run copy:ffmpeg` | Copy WASM cores to `public/ffmpeg/` |

## Limits

- Desktop: 500MB · Mobile: 200MB (browser memory safety)
- Formats: MP4, MOV, MKV, WebM, M4V
- Output: always MP4 (H.264 + AAC, yuv420p, faststart)

## Roadmap

- [ ] Web Worker encode (keep UI at 60fps on low-end phones)
- [ ] PWA install + offline engine cache
- [ ] Before/after preview + bitrate graph
- [ ] Batch queue (3 files)
- [ ] Custom target-size slider

## License

MIT — see [LICENSE](LICENSE).

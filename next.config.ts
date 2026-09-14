import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FFmpeg-WASM multithread needs SharedArrayBuffer -> COOP/COEP.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

export default nextConfig;

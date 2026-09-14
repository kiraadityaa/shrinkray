import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    engine: "ffmpeg-wasm",
    mode: "client-side",
    notes: "Encoding runs in the browser. This endpoint only checks the web app is alive.",
  });
}

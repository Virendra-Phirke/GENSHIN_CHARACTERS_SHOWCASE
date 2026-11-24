import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const parsed = new URL(url);
    const allowedHosts = [
      "enka.network",
      "static.nanoka.cc",
      "upload-os-bbs.hoyolab.com",
      "fastly.jsdelivr.net",
      "raw.githubusercontent.com",
    ];

    if (!allowedHosts.some((h) => parsed.hostname.endsWith(h))) {
      return new NextResponse("Host not permitted", { status: 403 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Upstream image failed: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}

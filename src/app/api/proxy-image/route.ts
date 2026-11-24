import { NextRequest, NextResponse } from "next/server";

// 1x1 transparent PNG fallback buffer
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

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
      "ambr.top",
      "gi.yatta.top",
      "homdgcat.wiki",
      "shinshin.moe",
      "genshin.jmp.blue",
      "api.ambr.top",
    ];

    if (!allowedHosts.some((h) => parsed.hostname.endsWith(h))) {
      return new NextResponse(TRANSPARENT_PNG, {
        headers: {
          "Content-Type": "image/png",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(TRANSPARENT_PNG, {
        headers: {
          "Content-Type": "image/png",
          "Access-Control-Allow-Origin": "*",
        },
      });
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
    return new NextResponse(TRANSPARENT_PNG, {
      headers: {
        "Content-Type": "image/png",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

import { NextResponse } from "next/server";
import { getPlanetAuthHeader, getPlanetThumbnailUrl } from "@/lib/planet/search";

/**
 * Proxies Planet thumbnail requests to keep the API key server-side.
 * Returns the thumbnail PNG as binary data, along with the scene bbox for overlay positioning.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemType, itemId } = body;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields: itemType, itemId" },
        { status: 400 }
      );
    }

    const thumbUrl = getPlanetThumbnailUrl(itemType, itemId);
    const authHeader = getPlanetAuthHeader();

    const res = await fetch(thumbUrl, {
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Planet thumbnail failed (${res.status}): ${text}` },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("Planet thumbnail error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get thumbnail" },
      { status: 500 }
    );
  }
}

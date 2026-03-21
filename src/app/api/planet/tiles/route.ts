import { NextResponse } from "next/server";
import { getPlanetTileUrl } from "@/lib/planet/tiles";

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

    const tileUrl = getPlanetTileUrl(itemType, itemId);

    return NextResponse.json({ tileUrl });
  } catch (err) {
    console.error("Planet tiles error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get tile URL" },
      { status: 500 }
    );
  }
}

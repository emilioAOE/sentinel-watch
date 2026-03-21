import { NextResponse } from "next/server";
import { fetchWaybackReleases } from "@/lib/esri/wayback";

export async function GET() {
  try {
    const releases = await fetchWaybackReleases();
    return NextResponse.json(
      { releases },
      { headers: { "Cache-Control": "public, max-age=86400" } }
    );
  } catch (err) {
    console.error("Wayback error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch Wayback releases" },
      { status: 500 }
    );
  }
}

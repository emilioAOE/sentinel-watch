import { NextResponse } from "next/server";
import { searchPlanetImagery } from "@/lib/planet/search";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bbox, dateFrom, dateTo, maxCloudCoverage, limit } = body;

    if (!bbox || !dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "Missing required fields: bbox, dateFrom, dateTo" },
        { status: 400 }
      );
    }

    const items = await searchPlanetImagery({
      bbox,
      dateFrom,
      dateTo,
      maxCloudCoverage,
      limit,
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("Planet search error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Planet search failed" },
      { status: 500 }
    );
  }
}

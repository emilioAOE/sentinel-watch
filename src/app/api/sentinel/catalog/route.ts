import { NextRequest, NextResponse } from "next/server";
import { searchImagery } from "@/lib/sentinel/catalog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bbox, dateFrom, dateTo, maxCloudCoverage, limit } = body as {
      bbox: [number, number, number, number];
      dateFrom: string;
      dateTo: string;
      maxCloudCoverage?: number;
      limit?: number;
    };

    if (!bbox || !dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "Missing required fields: bbox, dateFrom, dateTo" },
        { status: 400 }
      );
    }

    const result = await searchImagery({
      bbox,
      dateFrom,
      dateTo,
      maxCloudCoverage,
      limit,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sentinel catalog error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

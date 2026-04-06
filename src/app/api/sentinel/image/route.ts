import { NextRequest, NextResponse } from "next/server";
import { processRequest } from "@/lib/sentinel/process";
import { TIMAUKEL_BBOX } from "@/lib/timaukel/geodata";
import {
  getTimaukelEvalscript,
  type TimaukelVisualization,
} from "@/lib/timaukel/evalscripts";

const VALID_VIS = new Set<TimaukelVisualization>([
  "true_color",
  "ndvi",
  "false_color",
]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const date = searchParams.get("date");
    const vis = searchParams.get("vis") as TimaukelVisualization | null;

    if (!date || !vis || !VALID_VIS.has(vis)) {
      return NextResponse.json(
        { error: "Missing or invalid params. Required: date (YYYY-MM-DD), vis (true_color|ndvi|false_color)" },
        { status: 400 }
      );
    }

    const buffer = await processRequest({
      bbox: TIMAUKEL_BBOX,
      timeRange: {
        from: `${date}T00:00:00Z`,
        to: `${date}T23:59:59Z`,
      },
      evalscript: getTimaukelEvalscript(vis),
      width: 1024,
      height: 1024,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sentinel image error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

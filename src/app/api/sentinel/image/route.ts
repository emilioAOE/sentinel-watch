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
    const bboxParam = searchParams.get("bbox");

    if (!date || !vis || !VALID_VIS.has(vis)) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid params. Required: date (YYYY-MM-DD), vis (true_color|ndvi|false_color)",
        },
        { status: 400 }
      );
    }

    // Parse bbox or use default Timaukel bbox
    let bbox: [number, number, number, number] = TIMAUKEL_BBOX;
    if (bboxParam) {
      try {
        const parsed = JSON.parse(bboxParam);
        if (
          Array.isArray(parsed) &&
          parsed.length === 4 &&
          parsed.every((n: unknown) => typeof n === "number")
        ) {
          bbox = parsed as [number, number, number, number];
        }
      } catch {
        // ignore parse errors, use default
      }
    }

    const buffer = await processRequest({
      bbox,
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
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sentinel image error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

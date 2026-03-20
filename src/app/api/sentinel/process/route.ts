import { NextRequest, NextResponse } from "next/server";
import { processRequest } from "@/lib/sentinel/process";
import { getEvalscript } from "@/lib/sentinel/evalscripts";
import type { EvalscriptType } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bbox,
      timeRange,
      evalscriptType,
      width,
      height,
    } = body as {
      bbox: [number, number, number, number];
      timeRange: { from: string; to: string };
      evalscriptType: EvalscriptType;
      width?: number;
      height?: number;
    };

    if (!bbox || !timeRange || !evalscriptType) {
      return NextResponse.json(
        { error: "Missing required fields: bbox, timeRange, evalscriptType" },
        { status: 400 }
      );
    }

    const evalscript = getEvalscript(evalscriptType);
    if (!evalscript) {
      return NextResponse.json(
        { error: `Unknown evalscript type: ${evalscriptType}` },
        { status: 400 }
      );
    }

    const buffer = await processRequest({
      bbox,
      timeRange,
      evalscript,
      width,
      height,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sentinel process error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

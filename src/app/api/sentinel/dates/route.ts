import { NextResponse } from "next/server";
import { getSentinelToken } from "@/lib/sentinel/auth";
import { TIMAUKEL_BBOX, TIMAUKEL_DATE_RANGE } from "@/lib/timaukel/geodata";

export async function GET() {
  try {
    const token = await getSentinelToken();
    const allFeatures: { date: string; cloudCover: number }[] = [];
    let next: number | undefined;

    // Use regular catalog search (not distinct) to get cloud cover metadata
    do {
      const body: Record<string, unknown> = {
        collections: ["sentinel-2-l2a"],
        datetime: `${TIMAUKEL_DATE_RANGE.from}T00:00:00Z/${TIMAUKEL_DATE_RANGE.to}T23:59:59Z`,
        bbox: TIMAUKEL_BBOX,
        limit: 100,
      };

      if (next !== undefined) {
        body.next = next;
      }

      const res = await fetch(
        `${process.env.SENTINEL_HUB_CATALOG_URL}/search`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Catalog API error (${res.status}): ${text}`);
      }

      const data = await res.json();

      if (data.features) {
        for (const feature of data.features) {
          const dt = feature.properties?.datetime;
          if (!dt) continue;
          const dateStr = typeof dt === "string" ? dt.split("T")[0] : String(dt);
          const cloudCover = feature.properties?.["eo:cloud_cover"] ?? 100;
          allFeatures.push({ date: dateStr, cloudCover });
        }
      }

      next = data.context?.next;
    } while (next !== undefined);

    // Deduplicate by date, keep lowest cloud cover
    const dateMap = new Map<string, number>();
    for (const d of allFeatures) {
      const existing = dateMap.get(d.date);
      if (existing === undefined || d.cloudCover < existing) {
        dateMap.set(d.date, d.cloudCover);
      }
    }

    const dates = Array.from(dateMap.entries())
      .map(([date, cloudCover]) => ({ date, cloudCover }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ dates });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sentinel dates error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

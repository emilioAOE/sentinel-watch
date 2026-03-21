import type { PlanetSearchParams, PlanetSearchResultItem } from "./types";

const PLANET_DATA_URL =
  process.env.PLANET_DATA_URL || "https://api.planet.com/data/v1";
const PLANET_API_KEY = process.env.PLANET_API_KEY || "";

export async function searchPlanetImagery(
  params: PlanetSearchParams
): Promise<PlanetSearchResultItem[]> {
  const { bbox, dateFrom, dateTo, maxCloudCoverage = 50, limit = 30 } = params;
  const [west, south, east, north] = bbox;

  const body = {
    item_types: ["PSScene"],
    filter: {
      type: "AndFilter",
      config: [
        {
          type: "DateRangeFilter",
          field_name: "acquired",
          config: {
            gte: `${dateFrom}T00:00:00Z`,
            lte: `${dateTo}T23:59:59Z`,
          },
        },
        {
          type: "GeometryFilter",
          field_name: "geometry",
          config: {
            type: "Polygon",
            coordinates: [
              [
                [west, south],
                [east, south],
                [east, north],
                [west, north],
                [west, south],
              ],
            ],
          },
        },
        {
          type: "RangeFilter",
          field_name: "cloud_cover",
          config: {
            lte: maxCloudCoverage / 100, // Planet uses 0-1 range
          },
        },
      ],
    },
  };

  const authHeader = `Basic ${Buffer.from(`${PLANET_API_KEY}:`).toString("base64")}`;

  const res = await fetch(`${PLANET_DATA_URL}/quick-search?_page_size=${limit}&_sort=acquired desc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Planet search failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const features = data.features || [];

  // Map to our format
  const items: PlanetSearchResultItem[] = features.map(
    (f: {
      id: string;
      properties: { acquired: string; cloud_cover: number; item_type?: string };
    }) => ({
      id: f.id,
      date: f.properties.acquired.split("T")[0],
      cloud: Math.round(f.properties.cloud_cover * 100), // Convert 0-1 to percentage
      itemType: f.properties.item_type || "PSScene",
    })
  );

  // Deduplicate by date, keeping the one with lowest cloud cover
  const unique = new Map<string, PlanetSearchResultItem>();
  for (const item of items) {
    const existing = unique.get(item.date);
    if (!existing || existing.cloud > item.cloud) {
      unique.set(item.date, item);
    }
  }

  return Array.from(unique.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

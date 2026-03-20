import { getSentinelToken } from "./auth";
import type { CatalogSearchParams, CatalogSearchResult } from "./types";

export async function searchImagery(
  params: CatalogSearchParams
): Promise<CatalogSearchResult> {
  const token = await getSentinelToken();

  const body: Record<string, unknown> = {
    collections: ["sentinel-2-l2a"],
    datetime: `${params.dateFrom}T00:00:00Z/${params.dateTo}T23:59:59Z`,
    bbox: params.bbox,
    limit: params.limit ?? 20,
  };

  if (params.maxCloudCoverage !== undefined) {
    body.filter = `eo:cloud_cover < ${params.maxCloudCoverage}`;
    body["filter-lang"] = "cql2-text";
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

  return res.json();
}

import { getSentinelToken } from "./auth";
import type { ProcessRequestParams } from "./types";

export async function processRequest(
  params: ProcessRequestParams
): Promise<ArrayBuffer> {
  const token = await getSentinelToken();
  const format = params.format ?? "image/png";

  const body = {
    input: {
      bounds: {
        bbox: params.bbox,
        properties: {
          crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
        },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: params.timeRange,
            maxCloudCoverage: 30,
          },
        },
      ],
    },
    output: {
      width: params.width ?? 512,
      height: params.height ?? 512,
      responses: [
        { identifier: "default", format: { type: format } },
      ],
    },
    evalscript: params.evalscript,
  };

  const res = await fetch(process.env.SENTINEL_HUB_PROCESS_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: format,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Process API error (${res.status}): ${text}`);
  }

  return res.arrayBuffer();
}

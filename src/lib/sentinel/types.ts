export interface ProcessRequestParams {
  bbox: [number, number, number, number];
  timeRange: { from: string; to: string };
  evalscript: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface CatalogSearchParams {
  bbox: [number, number, number, number];
  dateFrom: string;
  dateTo: string;
  maxCloudCoverage?: number;
  limit?: number;
}

export interface CatalogFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    datetime: string;
    "eo:cloud_cover": number;
    [key: string]: unknown;
  };
}

export interface CatalogSearchResult {
  type: "FeatureCollection";
  features: CatalogFeature[];
  context?: {
    next?: number;
    limit: number;
    returned: number;
  };
}

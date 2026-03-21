export interface PlanetSearchParams {
  bbox: [number, number, number, number]; // [west, south, east, north]
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  maxCloudCoverage?: number; // 0-100, default 50
  limit?: number; // max results, default 30
}

export interface PlanetSearchResultItem {
  id: string;
  date: string; // YYYY-MM-DD
  cloud: number; // cloud cover percentage
  itemType: string; // e.g. "PSScene"
  bbox: [number, number, number, number]; // [west, south, east, north]
}

export interface PlanetSearchResult {
  items: PlanetSearchResultItem[];
}

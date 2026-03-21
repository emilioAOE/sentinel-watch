export interface WaybackRelease {
  releaseNum: number;
  date: string; // YYYY-MM-DD
  title: string;
}

const WAYBACK_CONFIG_URL =
  "https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json";

let cachedReleases: WaybackRelease[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchWaybackReleases(): Promise<WaybackRelease[]> {
  if (cachedReleases && Date.now() - cacheTime < CACHE_TTL) {
    return cachedReleases;
  }

  const res = await fetch(WAYBACK_CONFIG_URL);
  if (!res.ok) throw new Error(`Failed to fetch Wayback config: ${res.status}`);

  const data = await res.json();

  const releases: WaybackRelease[] = [];
  for (const [releaseNum, entry] of Object.entries(data)) {
    const e = entry as { itemTitle?: string };
    if (!e.itemTitle) continue;
    // Extract date from title like "World Imagery (Wayback 2024-03-07)"
    const match = e.itemTitle.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
      releases.push({
        releaseNum: parseInt(releaseNum, 10),
        date: match[1],
        title: e.itemTitle,
      });
    }
  }

  // Sort by date descending (newest first)
  releases.sort((a, b) => b.date.localeCompare(a.date));

  cachedReleases = releases;
  cacheTime = Date.now();
  return releases;
}

export function getWaybackTileUrl(releaseNum: number): string {
  return `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${releaseNum}/{z}/{y}/{x}`;
}

const PLANET_TILES_URL =
  process.env.PLANET_TILES_URL || "https://tiles.planet.com/data/v1";
const PLANET_API_KEY = process.env.PLANET_API_KEY || "";

/**
 * Generate the XYZ tile URL for a Planet scene.
 * The returned URL contains the API key and can be used directly by Leaflet's L.tileLayer().
 */
export function getPlanetTileUrl(itemType: string, itemId: string): string {
  return `${PLANET_TILES_URL}/${itemType}/${itemId}/{z}/{x}/{y}.png?api_key=${PLANET_API_KEY}`;
}

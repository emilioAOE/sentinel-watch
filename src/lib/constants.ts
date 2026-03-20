export const LONCOCHE_CENTER = { lat: -39.367, lng: -72.631 } as const;
export const DEFAULT_ZOOM = 12;

export const LONCOCHE_DEFAULT_BBOX: [number, number, number, number] = [
  -72.75, -39.45, -72.5, -39.28,
];

export const SENTINEL_CONFIG = {
  MAX_CLOUD_COVERAGE: 30,
  DEFAULT_WIDTH: 512,
  DEFAULT_HEIGHT: 512,
  PU_MONTHLY_LIMIT: 30000,
  PU_PER_512_REQUEST: 1,
} as const;

export const EVALSCRIPT_TYPES = [
  { id: "true_color", label: "True Color", description: "Natural color (RGB)" },
  { id: "false_color", label: "False Color", description: "Infrared composite" },
  { id: "ndvi", label: "NDVI", description: "Vegetation index" },
  { id: "ndbi", label: "NDBI", description: "Built-up index" },
  { id: "bsi", label: "BSI", description: "Bare Soil Index" },
  {
    id: "road_detection",
    label: "Road Detection",
    description: "Combined NDVI+BSI",
  },
] as const;

export type EvalscriptType = (typeof EVALSCRIPT_TYPES)[number]["id"];

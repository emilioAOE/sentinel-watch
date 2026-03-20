import type { EvalscriptType } from "@/lib/constants";

const TRUE_COLOR = `//VERSION=3
function setup() {
  return { input: ["B04", "B03", "B02", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  return [2.5*s.B04, 2.5*s.B03, 2.5*s.B02, s.dataMask];
}`;

const FALSE_COLOR = `//VERSION=3
function setup() {
  return { input: ["B08", "B04", "B03", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  return [2.5*s.B08, 2.5*s.B04, 2.5*s.B03, s.dataMask];
}`;

const NDVI = `//VERSION=3
function setup() {
  return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  if (ndvi < 0.0) return [0.5, 0.5, 0.5, s.dataMask];
  if (ndvi < 0.1) return [0.8, 0.4, 0.2, s.dataMask];
  if (ndvi < 0.2) return [0.9, 0.6, 0.3, s.dataMask];
  if (ndvi < 0.3) return [0.95, 0.85, 0.4, s.dataMask];
  if (ndvi < 0.5) return [0.5, 0.8, 0.3, s.dataMask];
  return [0.1, 0.5, 0.1, s.dataMask];
}`;

const NDBI = `//VERSION=3
function setup() {
  return { input: ["B08", "B11", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  let ndbi = (s.B11 - s.B08) / (s.B11 + s.B08);
  if (ndbi > 0.1) return [1.0, 0.3, 0.3, s.dataMask];
  if (ndbi > 0.0) return [1.0, 0.7, 0.3, s.dataMask];
  if (ndbi > -0.1) return [0.9, 0.9, 0.5, s.dataMask];
  return [0.2, 0.6, 0.2, s.dataMask];
}`;

const BSI = `//VERSION=3
function setup() {
  return { input: ["B02", "B04", "B08", "B11", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  let bsi = ((s.B11 + s.B04) - (s.B08 + s.B02)) / ((s.B11 + s.B04) + (s.B08 + s.B02));
  if (bsi > 0.2) return [0.9, 0.2, 0.1, s.dataMask];
  if (bsi > 0.1) return [1.0, 0.5, 0.2, s.dataMask];
  if (bsi > 0.0) return [0.9, 0.8, 0.4, s.dataMask];
  if (bsi > -0.1) return [0.6, 0.8, 0.4, s.dataMask];
  return [0.1, 0.5, 0.1, s.dataMask];
}`;

const ROAD_DETECTION = `//VERSION=3
function setup() {
  return { input: ["B02", "B03", "B04", "B08", "B11", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  let bsi = ((s.B11 + s.B04) - (s.B08 + s.B02)) / ((s.B11 + s.B04) + (s.B08 + s.B02));
  if (ndvi < 0.15 && bsi > 0.1) return [1.0, 0.2, 0.2, s.dataMask];
  if (ndvi < 0.25 && bsi > 0.0) return [1.0, 0.6, 0.2, s.dataMask];
  let g = 2.5;
  return [g*s.B04*0.6, g*s.B03*0.6, g*s.B02*0.6, s.dataMask];
}`;

const evalscriptMap: Record<EvalscriptType, string> = {
  true_color: TRUE_COLOR,
  false_color: FALSE_COLOR,
  ndvi: NDVI,
  ndbi: NDBI,
  bsi: BSI,
  road_detection: ROAD_DETECTION,
};

export function getEvalscript(type: EvalscriptType): string {
  return evalscriptMap[type];
}

export const EVALSCRIPT_LEGENDS: Record<
  EvalscriptType,
  { color: string; label: string }[]
> = {
  true_color: [],
  false_color: [
    { color: "#ff3333", label: "Vegetation (bright)" },
    { color: "#88cccc", label: "Roads / bare soil" },
  ],
  ndvi: [
    { color: "#1a801a", label: "Dense vegetation" },
    { color: "#80cc4d", label: "Moderate vegetation" },
    { color: "#f2d966", label: "Sparse vegetation" },
    { color: "#cc6633", label: "Bare soil / road" },
    { color: "#808080", label: "Water / shadow" },
  ],
  ndbi: [
    { color: "#ff4d4d", label: "Built-up / road" },
    { color: "#ffb34d", label: "Mixed" },
    { color: "#33993d", label: "Vegetation" },
  ],
  bsi: [
    { color: "#e63319", label: "Bare soil / road (high)" },
    { color: "#ff8033", label: "Moderate bare soil" },
    { color: "#e6cc66", label: "Transition" },
    { color: "#1a801a", label: "Vegetation" },
  ],
  road_detection: [
    { color: "#ff3333", label: "High confidence road" },
    { color: "#ff9933", label: "Possible road" },
    { color: "#667766", label: "Background (desaturated)" },
  ],
};

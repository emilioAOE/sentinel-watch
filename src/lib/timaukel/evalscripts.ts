export type TimaukelVisualization = "true_color" | "ndvi" | "false_color";

const EVALSCRIPTS: Record<TimaukelVisualization, string> = {
  true_color: `//VERSION=3
function setup() {
  return { input: ["B02", "B03", "B04"], output: { bands: 3 } };
}
function evaluatePixel(s) {
  return [2.5 * s.B04, 2.5 * s.B03, 2.5 * s.B02];
}`,

  ndvi: `//VERSION=3
function setup() {
  return { input: ["B04", "B08"], output: { bands: 3 } };
}
function evaluatePixel(s) {
  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  if (ndvi < 0) return [0.8, 0.2, 0.2];
  if (ndvi < 0.2) return [0.9, 0.8, 0.4];
  if (ndvi < 0.4) return [0.6, 0.8, 0.2];
  return [0.1, 0.5, 0.1];
}`,

  false_color: `//VERSION=3
function setup() {
  return { input: ["B03", "B04", "B08"], output: { bands: 3 } };
}
function evaluatePixel(s) {
  return [2.5 * s.B08, 2.5 * s.B04, 2.5 * s.B03];
}`,
};

export function getTimaukelEvalscript(type: TimaukelVisualization): string {
  return EVALSCRIPTS[type];
}

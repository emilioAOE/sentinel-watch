export const TIMAUKEL_BBOX: [number, number, number, number] = [
  -69.9226, -53.7354, -69.6527, -53.6397,
];

export const TIMAUKEL_CENTER = { lat: -53.688, lng: -69.788 } as const;

export const TIMAUKEL_DATE_RANGE = {
  from: "2025-08-28",
  to: "2026-01-31",
} as const;

export interface RanchPolygon {
  name: string;
  color: string;
  fillOpacity: number;
  coordinates: [number, number][];
}

export const RANCH_POLYGONS: RanchPolygon[] = [
  {
    name: "Área de Control",
    color: "#ef4444",
    fillOpacity: 0.05,
    coordinates: [
      [-53.6759, -69.92251],
      [-53.69354, -69.91252],
      [-53.73541, -69.77124],
      [-53.71325, -69.65267],
      [-53.63968, -69.68861],
      [-53.6759, -69.92251],
    ],
  },
  {
    name: "Potrero Consumo",
    color: "#eab308",
    fillOpacity: 0.15,
    coordinates: [
      [-53.68488, -69.91225],
      [-53.6854, -69.90974],
      [-53.68592, -69.90821],
      [-53.68761, -69.90544],
      [-53.68846, -69.90466],
      [-53.68875, -69.9043],
      [-53.68915, -69.90536],
      [-53.69033, -69.90762],
      [-53.69051, -69.90847],
      [-53.69097, -69.91028],
      [-53.69143, -69.91167],
      [-53.69177, -69.91321],
      [-53.69198, -69.91396],
      [-53.69197, -69.91399],
      [-53.69179, -69.91433],
      [-53.69137, -69.91591],
      [-53.69089, -69.91691],
      [-53.69028, -69.91896],
      [-53.68955, -69.91884],
      [-53.68868, -69.91819],
      [-53.68846, -69.91844],
      [-53.6873, -69.91662],
      [-53.68705, -69.91645],
      [-53.68488, -69.91225],
    ],
  },
  {
    name: "El Seis",
    color: "#22c55e",
    fillOpacity: 0.15,
    coordinates: [
      [-53.68188, -69.74236],
      [-53.6642, -69.75606],
      [-53.66405, -69.75544],
      [-53.66058, -69.74873],
      [-53.66037, -69.74743],
      [-53.66017, -69.74392],
      [-53.65921, -69.73947],
      [-53.65889, -69.73725],
      [-53.65869, -69.73558],
      [-53.65772, -69.73261],
      [-53.6574, -69.73094],
      [-53.65742, -69.7278],
      [-53.6574, -69.72327],
      [-53.65951, -69.72378],
      [-53.6593, -69.7177],
      [-53.65739, -69.71752],
      [-53.65738, -69.71543],
      [-53.65678, -69.7144],
      [-53.6587, -69.71151],
      [-53.66047, -69.71164],
      [-53.66035, -69.71058],
      [-53.65985, -69.7095],
      [-53.65929, -69.70747],
      [-53.6588, -69.70618],
      [-53.65803, -69.70496],
      [-53.65806, -69.70489],
      [-53.66421, -69.68654],
      [-53.66538, -69.68644],
      [-53.68188, -69.74236],
    ],
  },
  {
    name: "Pot 5 del Puesto",
    color: "#3b82f6",
    fillOpacity: 0.15,
    coordinates: [
      [-53.66633, -69.82398],
      [-53.66624, -69.82244],
      [-53.66682, -69.8182],
      [-53.6674, -69.81249],
      [-53.66754, -69.80787],
      [-53.66844, -69.80512],
      [-53.66724, -69.80343],
      [-53.66703, -69.80269],
      [-53.66682, -69.80139],
      [-53.66683, -69.80047],
      [-53.66706, -69.79789],
      [-53.66762, -69.79642],
      [-53.66703, -69.79471],
      [-53.66706, -69.79465],
      [-53.66761, -69.79435],
      [-53.66817, -69.79374],
      [-53.66947, -69.79361],
      [-53.67049, -69.793],
      [-53.67104, -69.79333],
      [-53.67133, -69.79286],
      [-53.67244, -69.79164],
      [-53.67248, -69.79159],
      [-53.67591, -69.81265],
      [-53.67479, -69.81381],
      [-53.67429, -69.81442],
      [-53.66633, -69.82398],
    ],
  },
];

export interface RanchRoute {
  name: string;
  color: string;
  dashArray: string;
  coordinates: [number, number][];
}

export const RANCH_ROUTE: RanchRoute = {
  name: "La Calle (ruta de arreo)",
  color: "#f97316",
  dashArray: "8 6",
  coordinates: [
    [-53.67995, -69.91447],
    [-53.67908, -69.91302],
    [-53.67889, -69.91211],
    [-53.67895, -69.91158],
    [-53.67846, -69.90986],
    [-53.67855, -69.90934],
    [-53.67827, -69.90843],
    [-53.67742, -69.9045],
    [-53.67746, -69.90384],
    [-53.67766, -69.90341],
    [-53.67773, -69.90201],
    [-53.67884, -69.89703],
    [-53.67853, -69.89674],
    [-53.67629, -69.89383],
    [-53.67508, -69.89243],
    [-53.6748, -69.89223],
    [-53.67486, -69.88823],
    [-53.67277, -69.8729],
    [-53.67191, -69.86602],
    [-53.67155, -69.86469],
    [-53.67155, -69.86468],
    [-53.67251, -69.86382],
    [-53.675, -69.88561],
    [-53.67542, -69.88913],
    [-53.67562, -69.89135],
    [-53.67583, -69.89191],
    [-53.6767, -69.89313],
    [-53.67779, -69.89408],
    [-53.67877, -69.89539],
    [-53.6792, -69.89688],
    [-53.67921, -69.89697],
    [-53.6793, -69.89744],
    [-53.6818, -69.91565],
    [-53.68205, -69.91626],
    [-53.6818, -69.91666],
    [-53.68164, -69.91663],
    [-53.68142, -69.91698],
    [-53.67995, -69.91447],
  ],
};

export interface RanchMarker {
  name: string;
  coordinates: [number, number]; // [lat, lng]
}

export const RANCH_MARKERS: RanchMarker[] = [
  { name: "Casco Timaukel", coordinates: [-53.6887, -69.9029] },
  { name: "Puesto el 5", coordinates: [-53.6928, -69.8019] },
  { name: "Puesto el 6", coordinates: [-53.6588, -69.7119] },
  { name: "Puesto La Puntilla", coordinates: [-53.6668, -69.8724] },
  { name: "Puesto Moreno", coordinates: [-53.6669, -69.7824] },
  { name: "Taller", coordinates: [-53.6666, -69.7968] },
  { name: "Puesto Aserradero", coordinates: [-53.7321, -69.9454] },
  { name: "Puesto Maria", coordinates: [-53.7455, -70.1199] },
];

export interface CaseEvent {
  date: string;
  title: string;
  description: string;
}

export const CASE_CHRONOLOGY: CaseEvent[] = [
  {
    date: "28 ago - 5 sep 2025",
    title: "Esquila en Casco Timaukel",
    description: "Esquila de ovejas en potrero Consumo, junto al Casco principal.",
  },
  {
    date: "~5 sep 2025",
    title: "Arreo por La Calle",
    description:
      "Arreo de ovejas esquiladas por la ruta La Calle hacia potreros 6 y 5.",
  },
  {
    date: "Sep - Ene 2025/26",
    title: "Parición en potreros",
    description:
      "Ovejas distribuidas en potreros El Seis y Cinco del Puesto durante temporada de parición.",
  },
  {
    date: "Enero 2026",
    title: "Marca \u2014 se detecta faltante",
    description:
      "Al realizar la marca se descubre un faltante significativo de ovejas. Se sospecha abigeato.",
  },
];

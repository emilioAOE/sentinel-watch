"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  TIMAUKEL_CENTER,
  TIMAUKEL_BBOX,
  RANCH_POLYGONS,
  RANCH_ROUTE,
  RANCH_MARKERS,
} from "@/lib/timaukel/geodata";
import { useTimaukelStore } from "@/stores/timaukel-store";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function addOverlays(map: L.Map) {
  for (const poly of RANCH_POLYGONS) {
    const polygon = L.polygon(poly.coordinates, {
      color: poly.color,
      weight: 2,
      fillOpacity: poly.fillOpacity,
      fillColor: poly.color,
    });
    polygon.bindTooltip(poly.name, { sticky: true });
    polygon.addTo(map);
  }

  const route = L.polyline(RANCH_ROUTE.coordinates, {
    color: RANCH_ROUTE.color,
    weight: 3,
    dashArray: RANCH_ROUTE.dashArray,
  });
  route.bindTooltip(RANCH_ROUTE.name, { sticky: true });
  route.addTo(map);

  for (const m of RANCH_MARKERS) {
    L.marker(m.coordinates).bindTooltip(m.name, { direction: "top" }).addTo(map);
  }
}

function DateSelector({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (date: string) => void;
  label: string;
}) {
  const dates = useTimaukelStore((s) => s.dates);

  return (
    <div className="flex items-center gap-2 p-2 bg-background/90 backdrop-blur border-b">
      <span className="text-xs font-medium">{label}:</span>
      <select
        className="text-xs border rounded px-2 py-1 bg-background flex-1"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Seleccionar fecha</option>
        {dates.map((d) => (
          <option key={d.date} value={d.date}>
            {format(parseISO(d.date), "d MMM yyyy", { locale: es })} (
            {Math.round(d.cloudCover)}% nubes)
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CompareView() {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftMapRef = useRef<L.Map | null>(null);
  const rightMapRef = useRef<L.Map | null>(null);
  const leftOverlayRef = useRef<L.ImageOverlay | null>(null);
  const rightOverlayRef = useRef<L.ImageOverlay | null>(null);
  const syncing = useRef(false);

  const compareDateLeft = useTimaukelStore((s) => s.compareDateLeft);
  const compareDateRight = useTimaukelStore((s) => s.compareDateRight);
  const setCompareDateLeft = useTimaukelStore((s) => s.setCompareDateLeft);
  const setCompareDateRight = useTimaukelStore((s) => s.setCompareDateRight);
  const visualization = useTimaukelStore((s) => s.visualization);
  const overlayOpacity = useTimaukelStore((s) => s.overlayOpacity);

  const syncMap = useCallback(
    (source: L.Map, target: L.Map) => {
      if (syncing.current) return;
      syncing.current = true;
      target.setView(source.getCenter(), source.getZoom(), { animate: false });
      syncing.current = false;
    },
    []
  );

  // Initialize both maps
  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;
    if (leftMapRef.current) return;

    const left = L.map(leftRef.current, {
      center: [TIMAUKEL_CENTER.lat, TIMAUKEL_CENTER.lng],
      zoom: 12,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      maxZoom: 18,
    }).addTo(left);
    addOverlays(left);

    const right = L.map(rightRef.current, {
      center: [TIMAUKEL_CENTER.lat, TIMAUKEL_CENTER.lng],
      zoom: 12,
      zoomControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
      maxZoom: 18,
    }).addTo(right);
    addOverlays(right);

    // Sync maps
    left.on("move", () => syncMap(left, right));
    right.on("move", () => syncMap(right, left));

    leftMapRef.current = left;
    rightMapRef.current = right;

    return () => {
      left.remove();
      right.remove();
      leftMapRef.current = null;
      rightMapRef.current = null;
    };
  }, [syncMap]);

  // Update left overlay
  useEffect(() => {
    const map = leftMapRef.current;
    if (!map) return;
    if (leftOverlayRef.current) {
      map.removeLayer(leftOverlayRef.current);
      leftOverlayRef.current = null;
    }
    if (!compareDateLeft) return;

    const url = `/api/sentinel/image?date=${compareDateLeft}&vis=${visualization}`;
    const [west, south, east, north] = TIMAUKEL_BBOX;
    leftOverlayRef.current = L.imageOverlay(
      url,
      [
        [south, west],
        [north, east],
      ],
      { opacity: overlayOpacity }
    ).addTo(map);
  }, [compareDateLeft, visualization, overlayOpacity]);

  // Update right overlay
  useEffect(() => {
    const map = rightMapRef.current;
    if (!map) return;
    if (rightOverlayRef.current) {
      map.removeLayer(rightOverlayRef.current);
      rightOverlayRef.current = null;
    }
    if (!compareDateRight) return;

    const url = `/api/sentinel/image?date=${compareDateRight}&vis=${visualization}`;
    const [west, south, east, north] = TIMAUKEL_BBOX;
    rightOverlayRef.current = L.imageOverlay(
      url,
      [
        [south, west],
        [north, east],
      ],
      { opacity: overlayOpacity }
    ).addTo(map);
  }, [compareDateRight, visualization, overlayOpacity]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col border-r">
          <DateSelector
            value={compareDateLeft}
            onChange={setCompareDateLeft}
            label="Izquierda"
          />
          <div ref={leftRef} className="flex-1" />
        </div>
        <div className="flex-1 flex flex-col">
          <DateSelector
            value={compareDateRight}
            onChange={setCompareDateRight}
            label="Derecha"
          />
          <div ref={rightRef} className="flex-1" />
        </div>
      </div>
    </div>
  );
}

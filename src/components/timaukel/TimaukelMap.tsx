"use client";

import { useEffect, useRef } from "react";
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

// Fix default marker icons in Next.js/webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function TimaukelMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);

  const selectedDate = useTimaukelStore((s) => s.selectedDate);
  const visualization = useTimaukelStore((s) => s.visualization);
  const overlayOpacity = useTimaukelStore((s) => s.overlayOpacity);
  const setImageLoading = useTimaukelStore((s) => s.setImageLoading);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [TIMAUKEL_CENTER.lat, TIMAUKEL_CENTER.lng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw polygons (static, once)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers: L.Layer[] = [];

    for (const poly of RANCH_POLYGONS) {
      const polygon = L.polygon(poly.coordinates, {
        color: poly.color,
        weight: 2,
        fillOpacity: poly.fillOpacity,
        fillColor: poly.color,
      });
      polygon.bindTooltip(poly.name, { sticky: true });
      polygon.addTo(map);
      layers.push(polygon);
    }

    // La Calle route (polyline)
    const route = L.polyline(RANCH_ROUTE.coordinates, {
      color: RANCH_ROUTE.color,
      weight: 3,
      dashArray: RANCH_ROUTE.dashArray,
    });
    route.bindTooltip(RANCH_ROUTE.name, { sticky: true });
    route.addTo(map);
    layers.push(route);

    return () => {
      layers.forEach((l) => map.removeLayer(l));
    };
  }, []);

  // Place markers (static, once)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];

    for (const m of RANCH_MARKERS) {
      const marker = L.marker(m.coordinates).addTo(map);
      marker.bindTooltip(m.name, { permanent: false, direction: "top" });
      markers.push(marker);
    }

    return () => {
      markers.forEach((mk) => map.removeLayer(mk));
    };
  }, []);

  // Update satellite overlay when date or visualization changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (!selectedDate) return;

    setImageLoading(true);

    const url = `/api/sentinel/image?date=${selectedDate}&vis=${visualization}`;
    const [west, south, east, north] = TIMAUKEL_BBOX;
    const bounds: L.LatLngBoundsExpression = [
      [south, west],
      [north, east],
    ];

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!mapRef.current) return;
      overlayRef.current = L.imageOverlay(url, bounds, {
        opacity: useTimaukelStore.getState().overlayOpacity,
      }).addTo(mapRef.current);
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageLoading(false);
    };
    img.src = url;
  }, [selectedDate, visualization, setImageLoading]);

  // Update overlay opacity
  useEffect(() => {
    overlayRef.current?.setOpacity(overlayOpacity);
  }, [overlayOpacity]);

  return <div ref={containerRef} className="w-full h-full" />;
}

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LONCOCHE_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { useZoneStore, type Zone } from "@/stores/zone-store";
import { useMapStore } from "@/stores/map-store";
import MapToolbar from "./MapToolbar";

// Fix default marker icons in Next.js/webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<L.ImageOverlay | null>(null);
  const zoneLayersRef = useRef<Map<string, L.Rectangle>>(new Map());
  const drawingRef = useRef<L.Rectangle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawBbox, setDrawBbox] = useState<[number, number, number, number] | null>(null);

  const zones = useZoneStore((s) => s.zones);
  const addZone = useZoneStore((s) => s.addZone);
  const { overlayUrl, overlayBbox, overlayOpacity, selectedZoneId, setSelectedZone } =
    useMapStore();

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [LONCOCHE_CENTER.lat, LONCOCHE_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw zones on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old layers for zones that no longer exist
    const currentIds = new Set(zones.map((z) => z.id));
    zoneLayersRef.current.forEach((layer, id) => {
      if (!currentIds.has(id)) {
        map.removeLayer(layer);
        zoneLayersRef.current.delete(id);
      }
    });

    // Add/update zone rectangles
    zones.forEach((zone) => {
      if (zoneLayersRef.current.has(zone.id)) return;
      const [west, south, east, north] = zone.bbox;
      const rect = L.rectangle(
        [
          [south, west],
          [north, east],
        ],
        {
          color: zone.id === selectedZoneId ? "#f97316" : "#3b82f6",
          weight: 2,
          fillOpacity: 0.1,
        }
      );
      rect.bindTooltip(zone.name);
      rect.on("click", () => setSelectedZone(zone.id));
      rect.addTo(map);
      zoneLayersRef.current.set(zone.id, rect);
    });
  }, [zones, selectedZoneId, setSelectedZone]);

  // Highlight selected zone
  useEffect(() => {
    zoneLayersRef.current.forEach((layer, id) => {
      layer.setStyle({
        color: id === selectedZoneId ? "#f97316" : "#3b82f6",
      });
    });
    if (selectedZoneId) {
      const layer = zoneLayersRef.current.get(selectedZoneId);
      if (layer) mapRef.current?.fitBounds(layer.getBounds(), { padding: [40, 40] });
    }
  }, [selectedZoneId]);

  // Update satellite overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (overlayUrl && overlayBbox) {
      const [west, south, east, north] = overlayBbox;
      overlayRef.current = L.imageOverlay(
        overlayUrl,
        [
          [south, west],
          [north, east],
        ],
        { opacity: overlayOpacity }
      ).addTo(map);
    }
  }, [overlayUrl, overlayBbox, overlayOpacity]);

  // Handle drawing mode
  const startDrawing = useCallback(() => {
    setIsDrawing(true);
    setDrawBbox(null);
    const map = mapRef.current;
    if (!map) return;

    if (drawingRef.current) {
      map.removeLayer(drawingRef.current);
      drawingRef.current = null;
    }

    map.getContainer().style.cursor = "crosshair";
    let startLatLng: L.LatLng | null = null;

    const onMouseDown = (e: L.LeafletMouseEvent) => {
      startLatLng = e.latlng;
    };

    const onMouseMove = (e: L.LeafletMouseEvent) => {
      if (!startLatLng) return;
      if (drawingRef.current) map.removeLayer(drawingRef.current);
      drawingRef.current = L.rectangle(
        [startLatLng, e.latlng],
        { color: "#f97316", weight: 2, dashArray: "5 5", fillOpacity: 0.15 }
      ).addTo(map);
    };

    const onMouseUp = (e: L.LeafletMouseEvent) => {
      if (!startLatLng) return;
      const bounds = L.latLngBounds(startLatLng, e.latlng);
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const bbox: [number, number, number, number] = [
        sw.lng, sw.lat, ne.lng, ne.lat,
      ];
      setDrawBbox(bbox);
      map.getContainer().style.cursor = "";
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
      map.dragging.enable();
    };

    map.dragging.disable();
    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);
  }, []);

  const confirmZone = useCallback(
    (name: string) => {
      if (!drawBbox) return;
      const zone = addZone({ name, bbox: drawBbox, status: "active" });
      setSelectedZone(zone.id);
      setIsDrawing(false);
      setDrawBbox(null);
      if (drawingRef.current && mapRef.current) {
        mapRef.current.removeLayer(drawingRef.current);
        drawingRef.current = null;
      }
    },
    [drawBbox, addZone, setSelectedZone]
  );

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawBbox(null);
    const map = mapRef.current;
    if (map) {
      map.getContainer().style.cursor = "";
      map.dragging.enable();
    }
    if (drawingRef.current && mapRef.current) {
      mapRef.current.removeLayer(drawingRef.current);
      drawingRef.current = null;
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <MapToolbar
        isDrawing={isDrawing}
        drawBbox={drawBbox}
        onStartDraw={startDrawing}
        onConfirm={confirmZone}
        onCancel={cancelDrawing}
      />
    </div>
  );
}

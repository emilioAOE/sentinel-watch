"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MapToolbarProps {
  isDrawing: boolean;
  drawBbox: [number, number, number, number] | null;
  onStartDraw: () => void;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  onFlyTo: (lat: number, lng: number) => void;
}

export default function MapToolbar({
  isDrawing,
  drawBbox,
  onStartDraw,
  onConfirm,
  onCancel,
  onFlyTo,
}: MapToolbarProps) {
  const [zoneName, setZoneName] = useState("");
  const [coords, setCoords] = useState("");
  const [coordError, setCoordError] = useState("");

  const parseDMS = (input: string): { lat: number; lng: number } | null => {
    // Match: 39°27'37.7"S 72°22'29.6"W  (with or without spaces, various quote styles)
    const dmsRegex = /(\d+)[°]\s*(\d+)[′']\s*([\d.]+)[″"]\s*([NSns])\s+(\d+)[°]\s*(\d+)[′']\s*([\d.]+)[″"]\s*([EWew])/;
    const m = input.match(dmsRegex);
    if (!m) return null;
    let lat = parseInt(m[1]) + parseInt(m[2]) / 60 + parseFloat(m[3]) / 3600;
    let lng = parseInt(m[5]) + parseInt(m[6]) / 60 + parseFloat(m[7]) / 3600;
    if (m[4].toUpperCase() === "S") lat = -lat;
    if (m[8].toUpperCase() === "W") lng = -lng;
    return { lat, lng };
  };

  const parseDecimal = (input: string): { lat: number; lng: number } | null => {
    const parts = input.split(",").map((s) => s.trim());
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  };

  const handleCoordsSubmit = () => {
    setCoordError("");
    const trimmed = coords.trim();
    if (!trimmed) return;

    const result = parseDMS(trimmed) ?? parseDecimal(trimmed);
    if (!result) {
      setCoordError("Ej: -39.46, -72.37 o 39°27'37.7\"S 72°22'29.6\"W");
      return;
    }
    if (result.lat < -90 || result.lat > 90 || result.lng < -180 || result.lng > 180) {
      setCoordError("Coordenadas fuera de rango");
      return;
    }
    onFlyTo(result.lat, result.lng);
    setCoords("");
  };

  if (drawBbox) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <Input
          placeholder="Zone name..."
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
          className="w-48"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && zoneName.trim()) {
              onConfirm(zoneName.trim());
              setZoneName("");
            }
          }}
        />
        <Button
          size="sm"
          onClick={() => {
            if (zoneName.trim()) {
              onConfirm(zoneName.trim());
              setZoneName("");
            }
          }}
          disabled={!zoneName.trim()}
        >
          Save Zone
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  if (isDrawing) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-background border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
        Click and drag to draw a rectangle zone
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Input
              placeholder="-39.46, -72.37"
              value={coords}
              onChange={(e) => { setCoords(e.target.value); setCoordError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleCoordsSubmit(); }}
              className="w-56 h-8 text-xs bg-background"
            />
            <Button size="sm" variant="outline" onClick={handleCoordsSubmit} className="h-8">
              Go
            </Button>
          </div>
          {coordError && (
            <p className="text-[10px] text-destructive mt-0.5 ml-1">{coordError}</p>
          )}
        </div>
      </div>
      <div className="absolute top-4 right-4 z-[1000]">
        <Button onClick={onStartDraw} size="sm">
          + New Zone
        </Button>
      </div>
    </>
  );
}

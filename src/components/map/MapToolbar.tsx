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
}

export default function MapToolbar({
  isDrawing,
  drawBbox,
  onStartDraw,
  onConfirm,
  onCancel,
}: MapToolbarProps) {
  const [zoneName, setZoneName] = useState("");

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
    <div className="absolute top-4 right-4 z-[1000]">
      <Button onClick={onStartDraw} size="sm">
        + New Zone
      </Button>
    </div>
  );
}

"use client";

import { useMapStore } from "@/stores/map-store";
import { EVALSCRIPT_LEGENDS } from "@/lib/sentinel/evalscripts";

export default function Legend() {
  const evalscript = useMapStore((s) => s.currentEvalscript);
  const items = EVALSCRIPT_LEGENDS[evalscript];

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">Legend</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-sm inline-block shrink-0"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}

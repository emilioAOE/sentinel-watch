"use client";

import { useTimaukelStore } from "@/stores/timaukel-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { TimaukelVisualization } from "@/lib/timaukel/evalscripts";

const VIS_OPTIONS: { value: TimaukelVisualization; label: string }[] = [
  { value: "true_color", label: "True Color" },
  { value: "ndvi", label: "NDVI" },
  { value: "false_color", label: "False Color" },
];

export default function VisualizationControls() {
  const visualization = useTimaukelStore((s) => s.visualization);
  const setVisualization = useTimaukelStore((s) => s.setVisualization);
  const overlayOpacity = useTimaukelStore((s) => s.overlayOpacity);
  const setOverlayOpacity = useTimaukelStore((s) => s.setOverlayOpacity);
  const compareMode = useTimaukelStore((s) => s.compareMode);
  const toggleCompareMode = useTimaukelStore((s) => s.toggleCompareMode);
  const imageLoading = useTimaukelStore((s) => s.imageLoading);

  return (
    <div className="flex flex-col gap-2 p-3 bg-background/90 backdrop-blur rounded-lg border shadow-sm">
      <div className="flex gap-1">
        {VIS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            size="sm"
            variant={visualization === opt.value ? "default" : "outline"}
            onClick={() => setVisualization(opt.value)}
            className="text-xs"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Opacidad
        </span>
        <Slider
          value={[overlayOpacity]}
          onValueChange={(v) => setOverlayOpacity(Array.isArray(v) ? v[0] : v)}
          min={0}
          max={1}
          step={0.05}
          className="flex-1"
        />
        <span className="text-xs w-8 text-right">
          {Math.round(overlayOpacity * 100)}%
        </span>
      </div>

      <Button
        size="sm"
        variant={compareMode ? "default" : "outline"}
        onClick={toggleCompareMode}
        className="text-xs w-full"
      >
        {compareMode ? "Salir de comparar" : "Comparar fechas"}
      </Button>

      {imageLoading && (
        <div className="text-xs text-muted-foreground text-center animate-pulse">
          Cargando imagen...
        </div>
      )}
    </div>
  );
}

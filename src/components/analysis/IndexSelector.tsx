"use client";

import { EVALSCRIPT_TYPES, type EvalscriptType } from "@/lib/constants";
import { useMapStore } from "@/stores/map-store";
import { Button } from "@/components/ui/button";

export default function IndexSelector() {
  const current = useMapStore((s) => s.currentEvalscript);
  const setEvalscript = useMapStore((s) => s.setEvalscript);

  return (
    <div className="flex flex-wrap gap-1.5">
      {EVALSCRIPT_TYPES.map((es) => (
        <Button
          key={es.id}
          size="sm"
          variant={current === es.id ? "default" : "outline"}
          onClick={() => setEvalscript(es.id as EvalscriptType)}
          title={es.description}
          className="text-xs"
        >
          {es.label}
        </Button>
      ))}
    </div>
  );
}

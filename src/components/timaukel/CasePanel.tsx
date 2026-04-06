"use client";

import { CASE_CHRONOLOGY } from "@/lib/timaukel/geodata";
import { useTimaukelStore } from "@/stores/timaukel-store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CasePanel() {
  const casePanelOpen = useTimaukelStore((s) => s.casePanelOpen);
  const setCasePanelOpen = useTimaukelStore((s) => s.setCasePanelOpen);

  if (!casePanelOpen) return null;

  return (
    <div className="w-72 border-l bg-background flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Contexto del Caso</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCasePanelOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-4">
        <div className="text-xs text-muted-foreground">
          Caso de abigeato en Estancia Timaukel, Tierra del Fuego, Chile.
        </div>

        <div className="space-y-3">
          {CASE_CHRONOLOGY.map((event, i) => (
            <div key={i} className="relative pl-4 border-l-2 border-muted pb-2">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                {event.date}
              </p>
              <p className="text-sm font-semibold">{event.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.description}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            <strong>Leyenda del mapa:</strong>
          </p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border-2 border-red-500" />
              Area de Control
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-yellow-500/30 border border-yellow-500" />
              Potrero Consumo
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500" />
              El Seis
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
              Pot 5 del Puesto
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0 border-t-2 border-dashed border-orange-500" />
              La Calle (arreo)
            </div>
          </div>
        </div>

        <div className="border-t pt-3 text-xs text-muted-foreground">
          <strong>Visualizaciones:</strong>
          <ul className="mt-1 space-y-1 list-disc pl-4">
            <li><strong>True Color:</strong> Color natural RGB</li>
            <li><strong>NDVI:</strong> Vegetacion (verde) vs suelo (cafe/rojo)</li>
            <li><strong>False Color:</strong> Infrarrojo — resalta caminos y movimiento de suelo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

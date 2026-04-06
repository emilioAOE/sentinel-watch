"use client";

import { useEffect } from "react";
import { useTimaukelStore } from "@/stores/timaukel-store";
import TimaukelMapContainer from "@/components/timaukel/TimaukelMapContainer";
import CompareViewContainer from "@/components/timaukel/CompareViewContainer";
import Timeline from "@/components/timaukel/Timeline";
import VisualizationControls from "@/components/timaukel/VisualizationControls";
import CasePanel from "@/components/timaukel/CasePanel";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function TimaukelPage() {
  const setDates = useTimaukelStore((s) => s.setDates);
  const setDatesLoading = useTimaukelStore((s) => s.setDatesLoading);
  const setDatesError = useTimaukelStore((s) => s.setDatesError);
  const compareMode = useTimaukelStore((s) => s.compareMode);
  const casePanelOpen = useTimaukelStore((s) => s.casePanelOpen);
  const setCasePanelOpen = useTimaukelStore((s) => s.setCasePanelOpen);

  // Fetch available dates on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchDates() {
      setDatesLoading(true);
      setDatesError(null);
      try {
        const res = await fetch("/api/sentinel/dates", { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setDates(data.dates);
        }
      } catch (err) {
        if (!cancelled) {
          setDatesError(
            err instanceof Error ? err.message : "Error al cargar fechas"
          );
        }
      } finally {
        if (!cancelled) {
          setDatesLoading(false);
        }
      }
    }

    fetchDates();
    return () => {
      cancelled = true;
    };
  }, [setDates, setDatesLoading, setDatesError]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
          <div>
            <h1 className="text-lg font-bold">
              Monitoreo Satelital — Estancia Timaukel
            </h1>
            <p className="text-xs text-muted-foreground">
              Analisis de imagenes Sentinel-2 &bull; Periodo: Sep 2025 - Ene 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!casePanelOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCasePanelOpen(true)}
                className="text-xs"
              >
                <PanelRight className="h-4 w-4 mr-1" />
                Caso
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 min-h-0">
          {/* Map area */}
          <div className="flex-1 flex flex-col relative">
            <div className="flex-1 relative">
              {compareMode ? <CompareViewContainer /> : <TimaukelMapContainer />}

              {/* Visualization controls overlay */}
              {!compareMode && (
                <div className="absolute top-3 right-3 z-[1000]">
                  <VisualizationControls />
                </div>
              )}

              {/* Visualization controls for compare mode (centered top) */}
              {compareMode && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
                  <VisualizationControls />
                </div>
              )}
            </div>

            {/* Timeline at bottom */}
            {!compareMode && <Timeline />}
          </div>

          {/* Case panel */}
          <CasePanel />
        </div>
      </div>
    </TooltipProvider>
  );
}

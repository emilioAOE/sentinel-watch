"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MapContainer from "@/components/map/MapContainer";
import AnalysisPanel from "@/components/analysis/AnalysisPanel";
import { useMapStore } from "@/stores/map-store";

export default function MapPage() {
  const searchParams = useSearchParams();
  const setSelectedZone = useMapStore((s) => s.setSelectedZone);

  useEffect(() => {
    const zoneId = searchParams.get("zone");
    if (zoneId) setSelectedZone(zoneId);
  }, [searchParams, setSelectedZone]);

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      <div className="flex-1 relative">
        <MapContainer />
      </div>
      <div className="w-80 border-l shrink-0 overflow-hidden">
        <AnalysisPanel />
      </div>
    </div>
  );
}

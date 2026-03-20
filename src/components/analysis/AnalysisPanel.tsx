"use client";

import { useCallback, useState } from "react";
import { format, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import IndexSelector from "./IndexSelector";
import Legend from "./Legend";
import { useMapStore } from "@/stores/map-store";
import { useZoneStore } from "@/stores/zone-store";

export default function AnalysisPanel() {
  const selectedZoneId = useMapStore((s) => s.selectedZoneId);
  const evalscript = useMapStore((s) => s.currentEvalscript);
  const overlayOpacity = useMapStore((s) => s.overlayOpacity);
  const setOverlayOpacity = useMapStore((s) => s.setOverlayOpacity);
  const setOverlay = useMapStore((s) => s.setOverlay);
  const isLoading = useMapStore((s) => s.isLoading);
  const setLoading = useMapStore((s) => s.setLoading);
  const selectedDate = useMapStore((s) => s.selectedDate);
  const setSelectedDate = useMapStore((s) => s.setSelectedDate);

  const zone = useZoneStore((s) => s.zones.find((z) => z.id === selectedZoneId));

  const [availableDates, setAvailableDates] = useState<
    { date: string; cloud: number }[]
  >([]);
  const [datesLoading, setDatesLoading] = useState(false);

  const searchDates = useCallback(async () => {
    if (!zone) return;
    setDatesLoading(true);
    try {
      const now = new Date();
      const res = await fetch("/api/sentinel/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bbox: zone.bbox,
          dateFrom: format(subMonths(now, 3), "yyyy-MM-dd"),
          dateTo: format(now, "yyyy-MM-dd"),
          maxCloudCoverage: 30,
          limit: 30,
        }),
      });
      const data = await res.json();
      if (data.features) {
        const dates = data.features.map(
          (f: { properties: { datetime: string; "eo:cloud_cover": number } }) => ({
            date: f.properties.datetime.split("T")[0],
            cloud: Math.round(f.properties["eo:cloud_cover"]),
          })
        );
        // Deduplicate by date, keep lowest cloud
        const unique = new Map<string, number>();
        for (const d of dates) {
          if (!unique.has(d.date) || unique.get(d.date)! > d.cloud) {
            unique.set(d.date, d.cloud);
          }
        }
        setAvailableDates(
          Array.from(unique.entries())
            .map(([date, cloud]) => ({ date, cloud }))
            .sort((a, b) => b.date.localeCompare(a.date))
        );
      }
    } catch (err) {
      console.error("Failed to search dates:", err);
    } finally {
      setDatesLoading(false);
    }
  }, [zone]);

  const fetchImagery = useCallback(async () => {
    if (!zone || !selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sentinel/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bbox: zone.bbox,
          timeRange: {
            from: `${selectedDate}T00:00:00Z`,
            to: `${selectedDate}T23:59:59Z`,
          },
          evalscriptType: evalscript,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch imagery");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setOverlay(url, zone.bbox);
    } catch (err) {
      console.error("Failed to fetch imagery:", err);
      alert(err instanceof Error ? err.message : "Failed to fetch imagery");
    } finally {
      setLoading(false);
    }
  }, [zone, selectedDate, evalscript, setOverlay, setLoading]);

  if (!zone) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select a zone on the map or create a new one to begin analysis.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div>
        <h3 className="font-semibold text-sm">{zone.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {zone.bbox.map((v) => v.toFixed(3)).join(", ")}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">Spectral Index</p>
        <IndexSelector />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Available Dates</p>
          <Button size="sm" variant="outline" onClick={searchDates} disabled={datesLoading}>
            {datesLoading ? "Searching..." : "Search Dates"}
          </Button>
        </div>
        {datesLoading && <Skeleton className="h-20 w-full" />}
        {availableDates.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
            {availableDates.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded flex justify-between items-center hover:bg-accent ${
                  selectedDate === d.date ? "bg-accent font-medium" : ""
                }`}
              >
                <span>{d.date}</span>
                <span className="text-muted-foreground">{d.cloud}% cloud</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        className="w-full"
        onClick={fetchImagery}
        disabled={!selectedDate || isLoading}
      >
        {isLoading ? "Fetching..." : "Fetch Imagery"}
      </Button>

      <div className="space-y-2">
        <p className="text-xs font-medium">
          Overlay Opacity: {Math.round(overlayOpacity * 100)}%
        </p>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[overlayOpacity * 100]}
          onValueChange={([v]) => setOverlayOpacity(v / 100)}
        />
      </div>

      <Legend />

      {useMapStore.getState().overlayUrl && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setOverlay(null, null)}
        >
          Clear Overlay
        </Button>
      )}
    </div>
  );
}

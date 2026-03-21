"use client";

import { useCallback, useState } from "react";
import { format, subMonths, addDays, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import IndexSelector from "./IndexSelector";
import Legend from "./Legend";
import { useMapStore } from "@/stores/map-store";
import { useZoneStore } from "@/stores/zone-store";
import { PROVIDERS } from "@/lib/constants";

const RESOLUTION_OPTIONS = [
  { value: 512, label: "512px", pu: "~1 PU" },
  { value: 1024, label: "1024px", pu: "~4 PU" },
  { value: 2048, label: "2048px", pu: "~16 PU" },
];

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
  const showBaseMap = useMapStore((s) => s.showBaseMap);
  const toggleBaseMap = useMapStore((s) => s.toggleBaseMap);
  const resolution = useMapStore((s) => s.resolution);
  const setResolution = useMapStore((s) => s.setResolution);
  const provider = useMapStore((s) => s.provider);
  const setProvider = useMapStore((s) => s.setProvider);
  const setPlanetTile = useMapStore((s) => s.setPlanetTile);

  const zone = useZoneStore((s) => s.zones.find((z) => z.id === selectedZoneId));

  const [availableDates, setAvailableDates] = useState<
    { date: string; cloud: number; itemId?: string; itemType?: string; bbox?: [number, number, number, number] }[]
  >([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [datesSearched, setDatesSearched] = useState(false);

  // Store the selected Planet item info for thumbnail fetching
  const [selectedPlanetItem, setSelectedPlanetItem] = useState<{
    itemId: string;
    itemType: string;
    bbox: [number, number, number, number];
  } | null>(null);

  const handleProviderChange = useCallback(
    (newProvider: typeof provider) => {
      if (newProvider === provider) return;
      setProvider(newProvider);
      // Clear all overlays and dates when switching
      setOverlay(null, null);
      setPlanetTile(null, null);
      setAvailableDates([]);
      setSelectedDate(null);
      setDatesSearched(false);
      setErrorMessage(null);
      setSelectedPlanetItem(null);
    },
    [provider, setProvider, setOverlay, setPlanetTile, setSelectedDate]
  );

  const searchDates = useCallback(async () => {
    if (!zone) return;
    setDatesLoading(true);
    setErrorMessage(null);
    setDatesSearched(false);
    try {
      const now = new Date();
      const dateFrom = format(subMonths(now, 3), "yyyy-MM-dd");
      const dateTo = format(now, "yyyy-MM-dd");

      if (provider === "sentinel") {
        const res = await fetch("/api/sentinel/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bbox: zone.bbox,
            dateFrom,
            dateTo,
            maxCloudCoverage: 50,
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
      } else {
        // Planet search
        const res = await fetch("/api/planet/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bbox: zone.bbox,
            dateFrom,
            dateTo,
            maxCloudCoverage: 50,
            limit: 30,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (data.items) {
          setAvailableDates(
            data.items.map((item: { id: string; date: string; cloud: number; itemType: string; bbox: [number, number, number, number] }) => ({
              date: item.date,
              cloud: item.cloud,
              itemId: item.id,
              itemType: item.itemType,
              bbox: item.bbox,
            }))
          );
        }
      }
      setDatesSearched(true);
    } catch (err) {
      console.error("Failed to search dates:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to search for available dates."
      );
    } finally {
      setDatesLoading(false);
    }
  }, [zone, provider]);

  const handleDateSelect = useCallback(
    (d: { date: string; itemId?: string; itemType?: string; bbox?: [number, number, number, number] }) => {
      setSelectedDate(d.date);
      if (d.itemId && d.itemType && d.bbox) {
        setSelectedPlanetItem({ itemId: d.itemId, itemType: d.itemType, bbox: d.bbox });
      } else {
        setSelectedPlanetItem(null);
      }
    },
    [setSelectedDate]
  );

  const fetchImagery = useCallback(async () => {
    if (!zone || !selectedDate) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      if (provider === "sentinel") {
        // Sentinel: fetch processed PNG
        const dateObj = new Date(`${selectedDate}T12:00:00Z`);
        const from = format(subDays(dateObj, 2), "yyyy-MM-dd");
        const to = format(addDays(dateObj, 2), "yyyy-MM-dd");

        const [west, south, east, north] = zone.bbox;
        const aspectRatio = Math.abs(east - west) / Math.abs(north - south);
        let width = resolution;
        let height = resolution;
        if (aspectRatio > 1) {
          height = Math.round(resolution / aspectRatio);
        } else {
          width = Math.round(resolution * aspectRatio);
        }

        const res = await fetch("/api/sentinel/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bbox: zone.bbox,
            timeRange: {
              from: `${from}T00:00:00Z`,
              to: `${to}T23:59:59Z`,
            },
            evalscriptType: evalscript,
            width,
            height,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch imagery");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPlanetTile(null, null); // Clear planet tiles
        setOverlay(url, zone.bbox);
      } else {
        // Planet: fetch thumbnail via proxy and display as image overlay
        if (!selectedPlanetItem) {
          throw new Error("No Planet scene selected");
        }

        const res = await fetch("/api/planet/tiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemType: selectedPlanetItem.itemType,
            itemId: selectedPlanetItem.itemId,
          }),
        });

        if (!res.ok) {
          let errMsg = "Failed to get Planet imagery";
          try {
            const err = await res.json();
            errMsg = err.error || errMsg;
          } catch {
            // response was not JSON (e.g. HTML error page)
          }
          throw new Error(errMsg);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPlanetTile(null, null); // Clear planet tiles
        setOverlay(url, selectedPlanetItem.bbox);
      }
    } catch (err) {
      console.error("Failed to fetch imagery:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to fetch imagery");
    } finally {
      setLoading(false);
    }
  }, [zone, selectedDate, evalscript, resolution, provider, selectedPlanetItem, setOverlay, setPlanetTile, setLoading]);

  const hasOverlay = useMapStore.getState().overlayUrl || useMapStore.getState().planetTileUrl;

  const clearOverlay = useCallback(() => {
    setOverlay(null, null);
    setPlanetTile(null, null);
  }, [setOverlay, setPlanetTile]);

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

      {/* Provider switcher */}
      <div className="space-y-2">
        <p className="text-xs font-medium">Imagery Provider</p>
        <div className="flex gap-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                provider === p.id
                  ? "ring-2 ring-primary bg-accent font-medium border-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              <div>{p.label}</div>
              <div className="text-[10px] text-muted-foreground">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Spectral index - only for Sentinel */}
      {provider === "sentinel" && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Spectral Index</p>
          <IndexSelector />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Available Dates</p>
          <Button size="sm" variant="outline" onClick={searchDates} disabled={datesLoading}>
            {datesLoading ? "Searching..." : "Search Dates"}
          </Button>
        </div>
        {datesLoading && <Skeleton className="h-20 w-full" />}
        {!datesLoading && datesSearched && availableDates.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">
            No clear imagery found for this zone in the last 3 months.
          </p>
        )}
        {availableDates.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1 border rounded p-2">
            {availableDates.map((d) => (
              <button
                key={d.itemId || d.date}
                onClick={() => handleDateSelect(d)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded flex justify-between items-center transition-colors ${
                  selectedDate === d.date
                    ? "ring-2 ring-primary bg-accent font-medium"
                    : "hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {selectedDate === d.date && (
                    <svg className="size-3 text-primary" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                  )}
                  {d.date}
                </span>
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

      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}

      {/* Resolution selector - only for Sentinel */}
      {provider === "sentinel" && (
        <div className="space-y-2">
          <p className="text-xs font-medium">Resolution</p>
          <div className="flex gap-1">
            {RESOLUTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setResolution(opt.value)}
                className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                  resolution === opt.value
                    ? "ring-2 ring-primary bg-accent font-medium border-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                <div>{opt.label}</div>
                <div className="text-[10px] text-muted-foreground">{opt.pu}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-medium">
          Overlay Opacity: {Math.round(overlayOpacity * 100)}%
        </p>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[overlayOpacity * 100]}
          onValueChange={(v) => setOverlayOpacity((Array.isArray(v) ? v[0] : v) / 100)}
        />
      </div>

      {/* Base map toggle - show when any overlay is active */}
      {hasOverlay && (
        <button
          onClick={toggleBaseMap}
          className="flex items-center gap-2 text-xs w-full px-2 py-1.5 rounded border border-border hover:bg-accent transition-colors"
        >
          <span
            className={`inline-block w-8 h-4 rounded-full transition-colors relative ${
              showBaseMap ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                showBaseMap ? "left-4" : "left-0.5"
              }`}
            />
          </span>
          Show base map
        </button>
      )}

      {/* Legend - only for Sentinel */}
      {provider === "sentinel" && <Legend />}

      {hasOverlay && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearOverlay}
        >
          Clear Overlay
        </Button>
      )}
    </div>
  );
}

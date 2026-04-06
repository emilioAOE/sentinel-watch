"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useTimaukelStore } from "@/stores/timaukel-store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { TimaukelVisualization } from "@/lib/timaukel/evalscripts";
import { ZONE_VIEWS } from "@/lib/timaukel/geodata";
import ImageZoomViewer from "./ImageZoomViewer";

const VIS_OPTIONS: { value: TimaukelVisualization; label: string }[] = [
  { value: "true_color", label: "True Color" },
  { value: "ndvi", label: "NDVI" },
  { value: "false_color", label: "False Color" },
];

function cloudColor(cc: number): string {
  if (cc < 30) return "bg-green-500";
  if (cc < 70) return "bg-yellow-500";
  return "bg-red-500";
}

function getImageUrl(
  date: string,
  vis: string,
  bbox: [number, number, number, number]
): string {
  return `/api/sentinel/image?date=${date}&vis=${vis}&bbox=${encodeURIComponent(JSON.stringify(bbox))}`;
}

export default function GalleryGrid() {
  const dates = useTimaukelStore((s) => s.dates);
  const visualization = useTimaukelStore((s) => s.visualization);
  const setVisualization = useTimaukelStore((s) => s.setVisualization);
  const galleryCloudFilter = useTimaukelStore((s) => s.galleryCloudFilter);
  const setGalleryCloudFilter = useTimaukelStore(
    (s) => s.setGalleryCloudFilter
  );

  const [loadedSet, setLoadedSet] = useState<Set<string>>(new Set());
  const [loadedCount, setLoadedCount] = useState(0);
  const [zoomInfo, setZoomInfo] = useState<{
    date: string;
    zoneId: string;
  } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const filteredDates = useMemo(() => {
    return dates
      .filter(
        (d) => d.date >= "2025-09-01" && d.cloudCover <= galleryCloudFilter
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dates, galleryCloudFilter]);

  // Total images: dates × zones
  const totalImages = filteredDates.length * ZONE_VIEWS.length;

  // Sequential loading: for each date, load all zones, then next date
  useEffect(() => {
    if (filteredDates.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoadedSet(new Set());
    setLoadedCount(0);

    let index = 0;
    let loaded = 0;
    const CONCURRENCY = 3;

    // Build flat list: [{date, zone}]
    const tasks: { date: string; zoneId: string; url: string }[] = [];
    for (const d of filteredDates) {
      for (const zone of ZONE_VIEWS) {
        tasks.push({
          date: d.date,
          zoneId: zone.id,
          url: getImageUrl(d.date, visualization, zone.bbox),
        });
      }
    }

    async function loadNext() {
      while (index < tasks.length) {
        if (controller.signal.aborted) return;
        const currentIndex = index++;
        const task = tasks[currentIndex];

        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loaded++;
            if (!controller.signal.aborted) {
              setLoadedSet(
                (prev) => new Set(prev).add(`${task.date}:${task.zoneId}`)
              );
              setLoadedCount(loaded);
            }
            resolve();
          };
          img.onerror = () => {
            loaded++;
            if (!controller.signal.aborted) {
              setLoadedCount(loaded);
            }
            resolve();
          };
          img.src = task.url;
        });
      }
    }

    Promise.all(Array.from({ length: CONCURRENCY }, () => loadNext()));

    return () => {
      controller.abort();
    };
  }, [filteredDates, visualization]);

  // Zoom navigation: build flat list of all date+zone combos for arrow nav
  const allCards = useMemo(() => {
    const cards: { date: string; zoneId: string }[] = [];
    for (const d of filteredDates) {
      for (const zone of ZONE_VIEWS) {
        cards.push({ date: d.date, zoneId: zone.id });
      }
    }
    return cards;
  }, [filteredDates]);

  const zoomIndex = useMemo(() => {
    if (!zoomInfo) return -1;
    return allCards.findIndex(
      (c) => c.date === zoomInfo.date && c.zoneId === zoomInfo.zoneId
    );
  }, [zoomInfo, allCards]);

  const handleZoomNav = useCallback(
    (direction: -1 | 1) => {
      const newIdx = zoomIndex + direction;
      if (newIdx >= 0 && newIdx < allCards.length) {
        setZoomInfo(allCards[newIdx]);
      }
    },
    [zoomIndex, allCards]
  );

  const zoomZone = zoomInfo
    ? ZONE_VIEWS.find((z) => z.id === zoomInfo.zoneId)
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Controls bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-background flex-wrap">
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

        <div className="h-4 w-px bg-border" />

        <div className="flex gap-1">
          <Button
            size="sm"
            variant={galleryCloudFilter === 100 ? "default" : "outline"}
            onClick={() => setGalleryCloudFilter(100)}
            className="text-xs"
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={galleryCloudFilter === 30 ? "default" : "outline"}
            onClick={() => setGalleryCloudFilter(30)}
            className="text-xs"
          >
            Despejadas (&lt;30%)
          </Button>
        </div>

        <div className="h-4 w-px bg-border" />

        <span className="text-xs text-muted-foreground">
          {loadedCount} / {totalImages} imagenes ({filteredDates.length} fechas
          &times; {ZONE_VIEWS.length} zonas)
        </span>

        {loadedCount < totalImages && (
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-20">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(loadedCount / totalImages) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Zone headers legend */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-b bg-muted/50 text-[10px] text-muted-foreground">
        <span className="w-20 shrink-0">Fecha</span>
        {ZONE_VIEWS.map((z) => (
          <div key={z.id} className="flex items-center gap-1 flex-1 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: z.color }}
            />
            <span className="truncate">{z.shortName}</span>
          </div>
        ))}
      </div>

      {/* Image grid: one row per date, columns = zones */}
      <div className="flex-1 overflow-y-auto">
        {filteredDates.map((d) => {
          const dateLabel = format(parseISO(d.date), "d MMM yyyy", {
            locale: es,
          });

          return (
            <div key={d.date} className="border-b">
              <div className="flex items-stretch">
                {/* Date label */}
                <div className="w-20 shrink-0 flex flex-col items-center justify-center px-1 py-2 bg-muted/30 border-r">
                  <span className="text-xs font-medium text-center leading-tight">
                    {dateLabel}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${cloudColor(d.cloudCover)}`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(d.cloudCover)}%
                    </span>
                  </div>
                </div>

                {/* Zone images */}
                {ZONE_VIEWS.map((zone) => {
                  const key = `${d.date}:${zone.id}`;
                  const isLoaded = loadedSet.has(key);
                  const url = getImageUrl(d.date, visualization, zone.bbox);

                  return (
                    <div
                      key={zone.id}
                      className="flex-1 min-w-0 border-r last:border-r-0 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-inset transition-all"
                      onClick={() =>
                        isLoaded &&
                        setZoomInfo({ date: d.date, zoneId: zone.id })
                      }
                    >
                      <div className="aspect-square relative">
                        {isLoaded ? (
                          <img
                            src={url}
                            alt={`${zone.shortName} ${d.date}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Skeleton className="w-full h-full" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zoom viewer */}
      {zoomInfo && zoomZone && (
        <ImageZoomViewer
          date={zoomInfo.date}
          cloudCover={
            filteredDates.find((d) => d.date === zoomInfo.date)?.cloudCover ?? 0
          }
          imageUrl={getImageUrl(zoomInfo.date, visualization, zoomZone.bbox)}
          visualization={visualization}
          zoneName={zoomZone.name}
          onClose={() => setZoomInfo(null)}
          onPrev={zoomIndex > 0 ? () => handleZoomNav(-1) : undefined}
          onNext={
            zoomIndex < allCards.length - 1
              ? () => handleZoomNav(1)
              : undefined
          }
        />
      )}
    </div>
  );
}

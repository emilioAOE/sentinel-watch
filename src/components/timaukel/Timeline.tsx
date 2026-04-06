"use client";

import { useTimaukelStore } from "@/stores/timaukel-store";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

function cloudColor(cc: number): string {
  if (cc < 30) return "bg-green-500";
  if (cc < 70) return "bg-yellow-500";
  return "bg-red-500";
}

function cloudBorder(cc: number): string {
  if (cc < 30) return "ring-green-400";
  if (cc < 70) return "ring-yellow-400";
  return "ring-red-400";
}

export default function Timeline() {
  const dates = useTimaukelStore((s) => s.dates);
  const selectedDate = useTimaukelStore((s) => s.selectedDate);
  const setSelectedDate = useTimaukelStore((s) => s.setSelectedDate);
  const datesLoading = useTimaukelStore((s) => s.datesLoading);

  if (datesLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-background/90 backdrop-blur border-t text-sm text-muted-foreground">
        <div className="animate-pulse">Cargando fechas disponibles...</div>
      </div>
    );
  }

  if (dates.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-background/90 backdrop-blur border-t text-sm text-muted-foreground">
        No se encontraron fechas disponibles.
      </div>
    );
  }

  // Group by month
  const months = new Map<string, typeof dates>();
  for (const d of dates) {
    const key = d.date.slice(0, 7); // YYYY-MM
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(d);
  }

  return (
    <div className="flex flex-col gap-1 px-3 py-2 bg-background/90 backdrop-blur border-t overflow-x-auto">
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
        <span>{dates.length} fechas disponibles</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> &lt;30%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" /> 30-70%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> &gt;70%
        </span>
        <span className="ml-auto text-[10px]">nubes</span>
      </div>
      <div className="flex items-end gap-0.5 min-w-0">
        {Array.from(months.entries()).map(([monthKey, monthDates]) => (
          <div key={monthKey} className="flex flex-col items-center gap-0.5">
            <div className="flex items-end gap-[3px]">
              {monthDates.map((d) => {
                const isSelected = d.date === selectedDate;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    title={`${format(parseISO(d.date), "d MMM yyyy", { locale: es })} — Nubes: ${Math.round(d.cloudCover)}%`}
                    className={`w-3 h-3 rounded-full transition-all ${cloudColor(d.cloudCover)} hover:scale-125 ${
                      isSelected
                        ? `ring-2 ${cloudBorder(d.cloudCover)} scale-125`
                        : "opacity-70 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {format(parseISO(`${monthKey}-01`), "MMM", { locale: es })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Zone {
  id: string;
  name: string;
  bbox: [number, number, number, number];
  createdAt: string;
  status: "active" | "paused";
}

interface ZoneState {
  zones: Zone[];
  addZone: (zone: Omit<Zone, "id" | "createdAt">) => Zone;
  removeZone: (id: string) => void;
  updateZone: (id: string, updates: Partial<Pick<Zone, "name" | "status">>) => void;
}

export const useZoneStore = create<ZoneState>()(
  persist(
    (set, get) => ({
      zones: [],
      addZone: (data) => {
        const zone: Zone = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set({ zones: [...get().zones, zone] });
        return zone;
      },
      removeZone: (id) =>
        set({ zones: get().zones.filter((z) => z.id !== id) }),
      updateZone: (id, updates) =>
        set({
          zones: get().zones.map((z) =>
            z.id === id ? { ...z, ...updates } : z
          ),
        }),
    }),
    { name: "sentinel-zones" }
  )
);

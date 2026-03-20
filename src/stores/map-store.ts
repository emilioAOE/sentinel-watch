import { create } from "zustand";
import type { EvalscriptType } from "@/lib/constants";

interface MapState {
  selectedZoneId: string | null;
  overlayOpacity: number;
  currentEvalscript: EvalscriptType;
  overlayUrl: string | null;
  overlayBbox: [number, number, number, number] | null;
  isLoading: boolean;
  selectedDate: string | null;
  showBaseMap: boolean;
  resolution: number;

  setSelectedZone: (id: string | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setEvalscript: (type: EvalscriptType) => void;
  setOverlay: (url: string | null, bbox: [number, number, number, number] | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedDate: (date: string | null) => void;
  toggleBaseMap: () => void;
  setResolution: (res: number) => void;
}

export const useMapStore = create<MapState>()((set) => ({
  selectedZoneId: null,
  overlayOpacity: 0.85,
  currentEvalscript: "road_detection",
  overlayUrl: null,
  overlayBbox: null,
  isLoading: false,
  selectedDate: null,
  showBaseMap: true,
  resolution: 1024,

  setSelectedZone: (id) => set({ selectedZoneId: id }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setEvalscript: (type) => set({ currentEvalscript: type }),
  setOverlay: (url, bbox) => set({ overlayUrl: url, overlayBbox: bbox }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleBaseMap: () => set((s) => ({ showBaseMap: !s.showBaseMap })),
  setResolution: (res) => set({ resolution: res }),
}));

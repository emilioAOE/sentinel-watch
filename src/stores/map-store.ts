import { create } from "zustand";
import type { EvalscriptType } from "@/lib/constants";
import type { ProviderId } from "@/lib/constants";

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
  provider: ProviderId;
  esriActive: boolean;
  esriTileUrl: string | null;
  // Change detection: second date
  selectedDateBefore: string | null;

  setSelectedZone: (id: string | null) => void;
  setOverlayOpacity: (opacity: number) => void;
  setEvalscript: (type: EvalscriptType) => void;
  setOverlay: (url: string | null, bbox: [number, number, number, number] | null) => void;
  setLoading: (loading: boolean) => void;
  setSelectedDate: (date: string | null) => void;
  toggleBaseMap: () => void;
  setResolution: (res: number) => void;
  setProvider: (p: ProviderId) => void;
  setEsriActive: (active: boolean) => void;
  setEsriTileUrl: (url: string | null) => void;
  setSelectedDateBefore: (date: string | null) => void;
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
  provider: "sentinel",
  esriActive: false,
  esriTileUrl: null,
  selectedDateBefore: null,

  setSelectedZone: (id) => set({ selectedZoneId: id }),
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  setEvalscript: (type) => set({ currentEvalscript: type }),
  setOverlay: (url, bbox) => set({ overlayUrl: url, overlayBbox: bbox }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleBaseMap: () => set((s) => ({ showBaseMap: !s.showBaseMap })),
  setResolution: (res) => set({ resolution: res }),
  setProvider: (p) => set({ provider: p }),
  setEsriActive: (active) => set({ esriActive: active }),
  setEsriTileUrl: (url) => set({ esriTileUrl: url }),
  setSelectedDateBefore: (date) => set({ selectedDateBefore: date }),
}));

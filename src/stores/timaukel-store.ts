import { create } from "zustand";
import type { TimaukelVisualization } from "@/lib/timaukel/evalscripts";

interface DateEntry {
  date: string;
  cloudCover: number;
}

interface TimaukelState {
  dates: DateEntry[];
  datesLoading: boolean;
  datesError: string | null;

  selectedDate: string | null;
  visualization: TimaukelVisualization;
  overlayOpacity: number;

  compareMode: boolean;
  compareDateLeft: string | null;
  compareDateRight: string | null;

  galleryMode: boolean;
  galleryCloudFilter: number;

  casePanelOpen: boolean;
  imageLoading: boolean;

  setGalleryMode: (mode: boolean) => void;
  setGalleryCloudFilter: (threshold: number) => void;
  setDates: (dates: DateEntry[]) => void;
  setDatesLoading: (loading: boolean) => void;
  setDatesError: (error: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setVisualization: (vis: TimaukelVisualization) => void;
  setOverlayOpacity: (opacity: number) => void;
  toggleCompareMode: () => void;
  setCompareDateLeft: (date: string | null) => void;
  setCompareDateRight: (date: string | null) => void;
  setCasePanelOpen: (open: boolean) => void;
  setImageLoading: (loading: boolean) => void;
}

export const useTimaukelStore = create<TimaukelState>((set) => ({
  dates: [],
  datesLoading: false,
  datesError: null,

  selectedDate: null,
  visualization: "true_color",
  overlayOpacity: 0.85,

  compareMode: false,
  compareDateLeft: null,
  compareDateRight: null,

  galleryMode: false,
  galleryCloudFilter: 100,

  casePanelOpen: true,
  imageLoading: false,

  setGalleryMode: (galleryMode) => set({ galleryMode, compareMode: false }),
  setGalleryCloudFilter: (galleryCloudFilter) => set({ galleryCloudFilter }),
  setDates: (dates) => set({ dates }),
  setDatesLoading: (datesLoading) => set({ datesLoading }),
  setDatesError: (datesError) => set({ datesError }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setVisualization: (visualization) => set({ visualization }),
  setOverlayOpacity: (overlayOpacity) => set({ overlayOpacity }),
  toggleCompareMode: () =>
    set((s) => ({ compareMode: !s.compareMode })),
  setCompareDateLeft: (compareDateLeft) => set({ compareDateLeft }),
  setCompareDateRight: (compareDateRight) => set({ compareDateRight }),
  setCasePanelOpen: (casePanelOpen) => set({ casePanelOpen }),
  setImageLoading: (imageLoading) => set({ imageLoading }),
}));

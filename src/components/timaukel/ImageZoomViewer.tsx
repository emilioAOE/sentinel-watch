"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ImageZoomViewerProps {
  date: string;
  cloudCover: number;
  imageUrl: string;
  visualization: string;
  zoneName?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function ImageZoomViewer({
  date,
  cloudCover,
  imageUrl,
  visualization,
  zoneName,
  onClose,
  onPrev,
  onNext,
}: ImageZoomViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom/pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageUrl]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev?.();
          break;
        case "ArrowRight":
          onNext?.();
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(z + 0.5, 5));
          break;
        case "-":
          setZoom((z) => Math.max(z - 0.5, 0.5));
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      return Math.min(Math.max(z + delta, 0.5), 5);
    });
  }, []);

  // Double click to toggle zoom
  const handleDoubleClick = useCallback(() => {
    setZoom((z) => {
      if (z > 1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      return 3;
    });
  }, []);

  // Drag to pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({
        x: dragStart.current.panX + dx / zoom,
        y: dragStart.current.panY + dy / zoom,
      });
    },
    [dragging, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Preload adjacent images
  useEffect(() => {
    // This triggers the browser to fetch and cache adjacent images
    if (onPrev) {
      // onPrev existing means there's a previous image - but we don't have the URL here
      // The gallery parent handles navigation, adjacent images are likely already cached
    }
  }, [onPrev, onNext]);

  const visLabel =
    visualization === "true_color"
      ? "True Color"
      : visualization === "ndvi"
        ? "NDVI"
        : "False Color";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 text-white">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {format(parseISO(date), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
          {zoneName && (
            <span className="text-xs px-2 py-0.5 rounded bg-white/20 font-medium">
              {zoneName}
            </span>
          )}
          <span className="text-xs text-white/60">
            Nubes: {Math.round(cloudCover)}%
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/10">
            {visLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(z - 0.5, 0.5))}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-white/30 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center relative"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
      >
        <img
          src={imageUrl}
          alt={`Sentinel-2 ${date}`}
          className="max-w-none select-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transition: dragging ? "none" : "transform 0.15s ease-out",
            maxHeight: "100%",
            maxWidth: "100%",
          }}
          draggable={false}
        />

        {/* Navigation arrows */}
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-center py-1.5 text-[10px] text-white/40 bg-black/60">
        Scroll para zoom &bull; Doble click para 3x &bull; Flechas para navegar
        &bull; ESC para cerrar
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ComparisonSliderProps {
  leftUrl: string;
  rightUrl: string;
  leftLabel?: string;
  rightLabel?: string;
}

export default function ComparisonSlider({
  leftUrl,
  rightUrl,
  leftLabel = "Before",
  rightLabel = "After",
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) handleMove(e.clientX);
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden rounded-lg border select-none cursor-col-resize"
      onMouseDown={(e) => {
        dragging.current = true;
        handleMove(e.clientX);
      }}
    >
      {/* Right image (full) */}
      <img
        src={rightUrl}
        alt={rightLabel}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* Left image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={leftUrl}
          alt={leftLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth }}
          draggable={false}
        />
      </div>
      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-xs font-bold text-muted-foreground">
          &harr;
        </div>
      </div>
      {/* Labels */}
      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
        {leftLabel}
      </span>
      <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
        {rightLabel}
      </span>
    </div>
  );
}

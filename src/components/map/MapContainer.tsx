"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full h-full rounded-none" />
  ),
});

export default function MapContainer() {
  return <MapView />;
}

"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const TimaukelMap = dynamic(() => import("./TimaukelMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export default function TimaukelMapContainer() {
  return <TimaukelMap />;
}

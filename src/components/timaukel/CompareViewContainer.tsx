"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CompareView = dynamic(() => import("./CompareView"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

export default function CompareViewContainer() {
  return <CompareView />;
}

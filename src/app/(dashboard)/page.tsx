"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useZoneStore } from "@/stores/zone-store";

export default function DashboardPage() {
  const zones = useZoneStore((s) => s.zones);
  const activeZones = zones.filter((z) => z.status === "active");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeZones.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{zones.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Free Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">30,000</p>
            <p className="text-xs text-muted-foreground">PU / month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Monitoring Zones</h2>
        <Link href="/map" className={buttonVariants({ size: "sm" })}>
          + New Zone
        </Link>
      </div>

      {zones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No monitoring zones created yet.
            </p>
            <Link href="/map" className={buttonVariants()}>
              Go to Map
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{zone.name}</CardTitle>
                  <Badge variant={zone.status === "active" ? "default" : "secondary"}>
                    {zone.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono">
                  {zone.bbox.map((v) => v.toFixed(3)).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(zone.createdAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/map?zone=${zone.id}`}
                  className={buttonVariants({ size: "sm", variant: "outline" }) + " w-full"}
                >
                  View on Map
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

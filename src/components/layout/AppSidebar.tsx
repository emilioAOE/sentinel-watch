"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useZoneStore } from "@/stores/zone-store";
import { useMapStore } from "@/stores/map-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/map", label: "Map", icon: "🗺️" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const zones = useZoneStore((s) => s.zones);
  const setSelectedZone = useMapStore((s) => s.setSelectedZone);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span>Sentinel Watch</span>
        </Link>
        <p className="text-xs text-muted-foreground">Road Detection System</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Zones ({zones.length})</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {zones.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No zones yet. Go to Map to create one.
                </p>
              )}
              {zones.map((zone) => (
                <SidebarMenuItem key={zone.id}>
                  <SidebarMenuButton
                    render={
                      <Link
                        href="/map"
                        onClick={() => setSelectedZone(zone.id)}
                      />
                    }
                  >
                    <span className="truncate">{zone.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 border-b flex items-center px-4 gap-2 shrink-0">
          <SidebarTrigger />
          <span className="text-sm font-medium">Sentinel Watch</span>
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}

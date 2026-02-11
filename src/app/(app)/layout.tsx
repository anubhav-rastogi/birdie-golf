import { Sidebar } from "@/components/app-shell/sidebar";
import { BottomTabs } from "@/components/app-shell/bottom-tabs";
import { TopBar } from "@/components/app-shell/top-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar (hidden on desktop where sidebar shows) */}
        <TopBar />

        {/* Page content — extra bottom padding on mobile for bottom tabs */}
        <main className="flex flex-1 flex-col pb-20 lg:pb-0 animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <BottomTabs />
    </div>
  );
}

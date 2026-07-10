import { ReactNode } from "react";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Topbar } from "@/components/layouts/Topbar";
import { RightSidebar } from "@/components/layouts/RightSidebar";
import { Footer } from "@/components/layouts/Footer";
import { StudioBackgroundWrapper } from "@/components/layouts/StudioBackgroundWrapper";
import { MobileSidebarDrawer } from "@/components/layouts/MobileSidebarDrawer";
import { BottomNav } from "@/components/layouts/BottomNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-foreground relative selection:bg-forge-500/30 selection:text-forge-200">
      {/* Client Background & Focus Player Wrapper */}
      <StudioBackgroundWrapper />

      {/* Mobile / Tablet: Animated drawer + backdrop — only rendered on < lg */}
      <MobileSidebarDrawer />

      {/* Desktop: Static sidebar — hidden on < lg via Sidebar's own hidden lg:contents wrapper */}
      <Sidebar />

      {/* Main column: Topbar + scrollable content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <div className="h-[64px] min-h-[64px] max-h-[64px] shrink-0 w-full relative z-30">
          <Topbar />
        </div>

        {/*
          Scrollable main content.
          – pb-[72px] on mobile/tablet to clear the fixed BottomNav (68px + 4px breathing room).
          – lg:pb-8 restores normal padding on desktop where BottomNav is hidden.
          – Responsive horizontal padding: p-4 sm:p-5 lg:p-6 xl:p-8
        */}
        <main
          className="
            flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden
            p-4 sm:p-5 lg:p-6 xl:p-8
            pb-[max(96px,calc(80px+env(safe-area-inset-bottom)))] lg:pb-8
            custom-scrollbar relative z-10 focus:outline-none
          "
          tabIndex={-1}
        >
          <div className="mx-auto max-w-7xl w-full min-h-[calc(100%-2rem)] flex flex-col justify-between gap-6 lg:gap-12">
            <div className="w-full flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* Studio Right Sidebar — full-width on mobile (existing behaviour), 380px on desktop */}
      <RightSidebar />

      {/* Premium Bottom Navigation — visible only on mobile / tablet (< lg) */}
      <BottomNav />
    </div>
  );
}

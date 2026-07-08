import { ReactNode } from "react";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Topbar } from "@/components/layouts/Topbar";
import { RightSidebar } from "@/components/layouts/RightSidebar";
import { Footer } from "@/components/layouts/Footer";
import { StudioBackgroundWrapper } from "@/components/layouts/StudioBackgroundWrapper";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0c] text-foreground relative selection:bg-forge-500/30 selection:text-forge-200">
      {/* Client Background & Focus Player Wrapper */}
      <StudioBackgroundWrapper />

      {/* Main Layout Elements */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative z-10">
        <Topbar />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar relative z-10 will-change-scroll transform-gpu">
          <div className="mx-auto max-w-7xl w-full min-h-[calc(100%-2rem)] flex flex-col justify-between gap-12">
            <div className="w-full flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>

      <RightSidebar />
    </div>
  );
}

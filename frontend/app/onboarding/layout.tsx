import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-forge-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

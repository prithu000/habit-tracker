"use client";

import { ReactNode } from "react";
import Link from "next/link";


export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-forge-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-forge-violet/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 40%, transparent 100%)'
        }} 
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-forge-500/10 border border-forge-500/20 mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-forge-400">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="text-2xl font-display font-bold tracking-tight">YOU VS YOU</h1>
          <p className="text-sm text-muted-foreground mt-1">Become the person you promised yourself you&apos;d be.</p>
        </div>

        {children}
      </div>
    </div>
  );
}

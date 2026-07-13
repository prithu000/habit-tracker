"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function DashboardHero() {
  return (
    <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-10 lg:p-12 bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-forge-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center justify-between">
        
        {/* Left Side: Copy */}
        <div className="flex-1 space-y-6 max-w-2xl text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 text-xs font-black uppercase tracking-widest">
              YOU VS YOU
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-[1.1]">
              Personal Operating System <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-400 to-purple-500">
                for Self Discipline.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-xl leading-relaxed">
              Build habits. Execute routines. Measure consistency. Become a better version of yourself every single day.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center md:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold tracking-wider text-zinc-300 uppercase mt-4"
          >
            <span className="bg-white/[0.05] border border-white/[0.1] px-4 py-2 rounded-xl">Track</span>
            <ArrowRight className="w-4 h-4 text-forge-400 shrink-0" />
            <span className="bg-white/[0.05] border border-white/[0.1] px-4 py-2 rounded-xl">Analyze</span>
            <ArrowRight className="w-4 h-4 text-forge-400 shrink-0" />
            <span className="bg-white/[0.05] border border-white/[0.1] px-4 py-2 rounded-xl text-forge-100">Evolve</span>
          </motion.div>
        </div>
        
        {/* Right Side: Motivational Callout */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-auto shrink-0"
        >
          <div className="p-6 sm:p-8 rounded-[24px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.1] max-w-[320px] mx-auto md:mx-0 shadow-inner text-center md:text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-forge-500 to-purple-600" />
            <p className="text-sm font-medium leading-relaxed italic text-zinc-300">
              &quot;Every action you complete today shapes tomorrow&apos;s version of you.&quot;
            </p>
            <div className="mt-4 text-[10px] uppercase tracking-widest font-bold text-forge-400">
              Day One begins now.
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}

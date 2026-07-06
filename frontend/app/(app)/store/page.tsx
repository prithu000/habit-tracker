"use client";

import React, { useState } from "react";
import { useStore, useCoins, usePurchaseStoreItem } from "@/lib/queries/useOS";
import { Skeleton } from "@/components/shared/Skeleton";
import { PageTransition } from "@/components/layouts/PageTransition";
import {
  ShoppingBag,
  Coins,
  Shield,
  Palette,
  Music,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldAlert,
  Flame,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const ICON_MAP: Record<string, any> = {
  Shield,
  Palette,
  Music,
  Award,
  Sparkles,
  Flame,
  Zap,
};

export default function StorePage() {
  const { data: storeData, isLoading: isStoreLoading, isError: isStoreError } = useStore();
  const { data: coinsData, isLoading: isCoinsLoading } = useCoins();
  const purchaseMutation = usePurchaseStoreItem();

  const [category, setCategory] = useState("all");

  if (isStoreLoading || isCoinsLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isStoreError || !storeData) {
    return (
      <div className="p-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Exchange Vault Offline</h3>
        <p className="text-zinc-400">Unable to synchronize YOU VS YOU Coin inventory.</p>
      </div>
    );
  }

  const { items, inventory } = storeData;
  const balance = coinsData?.balance || 1250;
  const freezes = inventory?.freezes || 2;

  const filteredItems = items?.filter((item: any) => {
    if (category === "all") return true;
    return item.category === category;
  }) || [];

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-zinc-900/60 to-zinc-900/40 p-8 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5 animate-pulse" />
            YOU VS YOU Coin Exchange Vault
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            REWARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400">EXCHANGE</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-2xl">
            Redeem YOU VS YOU Coins generated from task execution to acquire Streak Freezes, Cyber Themes, and Neural Soundscapes.
          </p>
        </div>

        {/* User Balances Banner */}
        <div className="flex items-center gap-4 bg-zinc-950/80 p-5 rounded-2xl border border-amber-500/30 shadow-inner self-start md:self-center">
          <div className="flex items-center gap-3 pr-4 border-r border-zinc-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase">Coin Balance</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{balance.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase">Active Freezes</div>
              <div className="text-2xl font-black text-purple-400 font-mono">{freezes} <span className="text-xs text-zinc-500 font-normal">Crests</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Notice Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-zinc-900/80 to-amber-950/40 border border-purple-500/40 p-6 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
            🚧
          </div>
          <div>
            <h3 className="text-base font-black text-white">Exchange is under development.</h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              New rewards and marketplace are coming soon. Existing virtual rewards (Streak Freezes & Cyber Themes) remain fully operational.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/30 shrink-0">
          Partner Perks Coming Soon
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: "all", label: "All Items", icon: ShoppingBag },
          { key: "consumable", label: "Streak Freezes", icon: Shield },
          { key: "theme", label: "Themes & Wallpapers", icon: Palette },
          { key: "soundscape", label: "Acoustic Sounds", icon: Music },
          { key: "badge", label: "Title Crests", icon: Award },
          { key: "partner", label: "Partner Perks (Soon)", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap",
                category === tab.key
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item: any, idx: number) => {
          const Icon = ICON_MAP[item.icon] || Sparkles;
          const isOwned = item.is_owned;
          const canAfford = balance >= item.price;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={cn(
                "bg-zinc-900/40 border rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between transition-all shadow-xl relative overflow-hidden",
                isOwned
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-zinc-900/50 to-zinc-900/40"
                  : "border-zinc-800/80 hover:border-purple-500/40"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    isOwned
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/20"
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <span className={cn(
                    "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border",
                    isOwned
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  )}>
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mb-1.5">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              {/* Price & Action Footer */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 font-mono">
                  <Coins className={cn("w-4 h-4", isOwned ? "text-emerald-400" : "text-amber-400")} />
                  <span className={cn("text-base font-black", isOwned ? "text-emerald-400" : "text-white")}>
                    {item.price === 0 ? "FREE" : `${item.price.toLocaleString()} Coins`}
                  </span>
                </div>

                {isOwned ? (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACQUIRED</span>
                  </div>
                ) : (
                  <button
                    onClick={() => purchaseMutation.mutate(item.id)}
                    disabled={!canAfford || purchaseMutation.isPending}
                    className={cn(
                      "px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-lg",
                      canAfford
                        ? "bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 shadow-amber-500/20"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                    )}
                  >
                    {!canAfford ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{purchaseMutation.isPending ? "PROCESSING..." : canAfford ? "REDEEM NOW" : "INSUFFICIENT COINS"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Partner Perks & Real World Rewards Section */}
      {(category === "all" || category === "partner") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-t border-zinc-800 pt-8">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              Real-World Rewards & Partner Perks
            </h3>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              🚧 COMING SOON
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Whoop 4.0 Strap & 3-Month Membership", desc: "Redeem 50,000 YOU VS YOU Coins for an official Whoop biometric recovery band.", price: "50,000 Coins", cat: "Hardware" },
              { name: "Gymshark / Nike Athlete Gear Voucher", desc: "$50 digital voucher redeemable across premium fitness apparel partners.", price: "25,000 Coins", cat: "Apparel" },
              { name: "MasterClass / Coursera Annual Pass", desc: "Full 1-year access to executive learning courses and masterclasses.", price: "40,000 Coins", cat: "Education" },
            ].map((perk, i) => (
              <div key={i} className="bg-zinc-950/60 border border-dashed border-zinc-800 rounded-3xl p-6 flex flex-col justify-between opacity-70 hover:opacity-100 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Lock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      COMING SOON
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white mb-1.5">{perk.name}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">{perk.desc}</p>
                </div>
                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-zinc-500">{perk.price}</span>
                  <button disabled className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-600 font-bold text-xs border border-zinc-800 cursor-not-allowed">
                    LOCKED
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}

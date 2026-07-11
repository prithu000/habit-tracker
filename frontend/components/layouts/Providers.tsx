"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRef, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "./AuthGuard";
import { PaywallModal } from "@/components/shared/PaywallModal";

export function Providers({ children }: { children: ReactNode }) {
  // Use useRef to ensure QueryClient is created only once and never recreated
  const queryClientRef = useRef<QueryClient | null>(null);
  
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes fresh cache across all routes
          gcTime: 30 * 60 * 1000, // 30 minutes in-memory retention
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: false, // Prevent duplicate API calls on page navigation
          refetchOnReconnect: false,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <AuthGuard>
        {children}
      </AuthGuard>
      <PaywallModal />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          }
        }} 
      />
      <div className="hidden lg:block">
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
}

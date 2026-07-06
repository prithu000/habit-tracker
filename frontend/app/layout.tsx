import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layouts/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YOU VS YOU — Personal Operating System",
  description:
    "YOU VS YOU is your personal operating system. Build self-trust through daily discipline. Every completed task is proof that you keep promises to yourself.",
  keywords: ["habits", "productivity", "self-improvement", "discipline", "routines", "you vs you", "personal os"],
  openGraph: {
    title: "YOU VS YOU",
    description: "Become the person you promised yourself you'd be.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

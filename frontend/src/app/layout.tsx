import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "NETRA - AI-Driven Disaster Intelligence Platform | SIH 2026 Prototype",
  description: "AI-Powered Disaster Information Fusion & Operational Digital Twin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#080e18] text-slate-200 antialiased selection:bg-sky-600 selection:text-white flex flex-col min-h-screen`}>
        {/* TOP BAR */}
        <header id="global-top-bar" className="h-14 border-b border-slate-800 bg-[#0b192c]/50 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]">
              N
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider text-slate-100">NETRA</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Emergency Response Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-900/40 hover:bg-sky-900/70 rounded-full border border-sky-700/50 text-sky-300 transition-colors">
              <span className="material-symbols-outlined text-[14px]">map</span>
              Dashboard
            </a>
            <a href="/#report-incident" className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/70 rounded-full border border-rose-700/50 text-rose-300 transition-colors">
              Geo Tagged photo (Public/Citizen)
            </a>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
              System Operational
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700 text-slate-300">
              Pune District
            </div>
          </div>
        </header>
        
        {/* MAIN LAYOUT */}
        <main className="flex-1 relative">
          {children}
        </main>
      </body>
    </html>
  );
}

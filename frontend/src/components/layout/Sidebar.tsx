"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { INDICATORS } from "@/lib/constants";
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  Settings,
  Database,
  HelpCircle,
  BarChart3,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/40 bg-background/50 backdrop-blur-xl saturate-150 shadow-[4px_0_24px_rgba(0,0,0,0.02)] hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-emerald-400 rounded-xl opacity-60 blur-[3px]"></div>
            <div className="relative w-full h-full bg-gradient-to-tr from-primary to-emerald-500 rounded-xl flex items-center justify-center border border-white/20 shadow-lg shadow-primary/30">
               <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M3 3v18h18" />
                 <path d="m19 9-5 5-4-4-3 3" />
               </svg>
            </div>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
            EconoNigeria
          </span>
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Dashboard
          </p>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          
          <Link
            href="/research"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
              pathname === "/research" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <BookOpen className="w-4 h-4" />
            Research Hub
          </Link>
          
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
              pathname === "/admin" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Database className="w-4 h-4" />
            Admin Dashboard
          </Link>
        </div>

        <div>
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Economic Indicators
          </p>
          {INDICATORS.map((ind) => {
            const isActive = pathname === `/${ind.slug}`;
            
            return (
              <Link
                key={ind.slug}
                href={`/${ind.slug}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <LineChart className="w-4 h-4" />
                {ind.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-border space-y-1">
        <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Database className="w-4 h-4" />
          Public API Docs
        </a>
        <a href="https://github.com/israeleromon-lab/EcoNigeria" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
          Contribute on GitHub
        </a>
      </div>
    </aside>
  );
}

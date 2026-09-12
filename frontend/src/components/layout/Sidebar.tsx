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

export function Sidebar({ className, onLinkClick }: { className?: string, onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 border-r border-border bg-background flex flex-col h-[100dvh] sticky top-0", className)}>
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="relative w-full h-full bg-foreground rounded-lg flex items-center justify-center shadow-sm">
               <svg className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M3 3v18h18" />
                 <path d="m19 9-5 5-4-4-3 3" />
               </svg>
            </div>
          </div>
          <span className="text-foreground tracking-tight font-extrabold">
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
            onClick={onLinkClick}
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
            onClick={onLinkClick}
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
            href="/methodology"
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-1",
              pathname === "/methodology" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <HelpCircle className="w-4 h-4" />
            Methodology
          </Link>
          
          <Link
            href="/admin"
            onClick={onLinkClick}
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

        <div className="pb-6">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Economic Indicators
          </p>
          {INDICATORS.map((ind) => {
            const isActive = pathname === `/${ind.slug}`;
            
            return (
              <Link
                key={ind.slug}
                href={`/${ind.slug}`}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
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
        <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" rel="noreferrer" onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Database className="w-4 h-4" />
          Public API Docs
        </a>
        <a href="https://github.com/israeleromon-lab/EcoNigeria" target="_blank" rel="noreferrer" onClick={onLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <HelpCircle className="w-4 h-4" />
          Contribute on GitHub
        </a>
      </div>
    </aside>
  );
}

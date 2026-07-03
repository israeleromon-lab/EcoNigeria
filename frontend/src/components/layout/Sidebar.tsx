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
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          EconoNigeria
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

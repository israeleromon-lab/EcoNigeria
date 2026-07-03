"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { INDICATORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  Database,
  HelpCircle,
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle client-side mounting for Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when pathname changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const sidebarContent = (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      <div className={cn(
        "fixed inset-y-0 left-0 z-[110] w-72 bg-background/95 backdrop-blur-2xl border-r border-border/40 shadow-2xl transform transition-transform duration-300 ease-out md:hidden flex flex-col",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between border-b border-border/40">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-emerald-400 rounded-lg opacity-60 blur-[2px]"></div>
              <div className="relative w-full h-full bg-gradient-to-tr from-primary to-emerald-500 rounded-lg flex items-center justify-center border border-white/20">
                 <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M3 3v18h18" />
                   <path d="m19 9-5 5-4-4-3 3" />
                 </svg>
              </div>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-500">
              EconoNigeria
            </span>
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="mb-6">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Dashboard
            </p>
            <Link
              href="/"
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
      </div>
    </>
  );

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu className="w-5 h-5" />
        <span className="sr-only">Toggle mobile menu</span>
      </Button>

      {mounted && createPortal(sidebarContent, document.body)}
    </>
  );
}

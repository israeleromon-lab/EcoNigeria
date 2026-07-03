"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { INDICATORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  Settings,
  Database,
  HelpCircle,
} from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle mobile menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-background/90 backdrop-blur-xl border-border/40">
        <div className="p-6 pb-2 border-b border-border/40">
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
      </SheetContent>
    </Sheet>
  );
}

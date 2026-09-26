"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  const links = [
    { name: "Explore", href: "/" },
    { name: "Forecast Lab", href: "/forecasts" },
    { name: "Research Hub", href: "/research" },
    { name: "Compare (Africa)", href: "/compare" },
    { name: "Data Status", href: "/status" },
    { name: "API Docs", href: "/developers" },
    { name: "Methodology", href: "/methodology" },
    { name: "Roadmap", href: "https://github.com/israeleromon-lab/EcoNigeria/blob/main/ROADMAP.md", external: true },
  ];

  return (
    <header className="h-14 border-b border-border dark:border-white/[0.08] bg-background dark:bg-[#0B0F17] flex items-center justify-between px-3 sm:px-6 sticky top-0 z-50 shrink-0 gap-2">
      <div className="flex items-center gap-3 lg:gap-5 xl:gap-8 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 shrink-0"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm sm:text-base xl:text-lg font-mono font-bold tracking-tight text-foreground uppercase border border-emerald-500/40 bg-emerald-500/[0.06] px-2 sm:px-2.5 py-0.5 whitespace-nowrap"
          >
            <span className="inline-block w-2 h-2 bg-emerald-500 shrink-0" />
            <span>EconoNigeria</span>
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 overflow-x-auto no-scrollbar">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={cn(
                "text-[11px] xl:text-xs font-mono uppercase tracking-wider transition-colors hover:text-foreground py-1 whitespace-nowrap shrink-0",
                pathname === link.href
                  ? "text-emerald-600 dark:text-emerald-400 border-b border-emerald-500 font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Terminal Active
        </div>
        <ThemeToggle />
        <a 
          href="https://github.com/israeleromon-lab/EcoNigeria" 
          target="_blank" 
          rel="noreferrer"
          className="hidden sm:flex h-8 px-3 border border-border dark:border-white/[0.12] items-center justify-center text-foreground hover:bg-muted transition-colors text-xs font-mono uppercase tracking-wider whitespace-nowrap"
        >
          Source
        </a>
      </div>
    </header>
  );
}



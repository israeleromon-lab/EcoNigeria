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
    { name: "Methodology", href: "/methodology" },
    { name: "Data Status", href: "/status" },
    { name: "Data Sources", href: "https://github.com/israeleromon-lab/EcoNigeria/blob/main/docs/data-sources.md", external: true },
    { name: "API Docs", href: "https://github.com/israeleromon-lab/EcoNigeria/tree/main/docs", external: true },
    { name: "Roadmap", href: "https://github.com/israeleromon-lab/EcoNigeria/blob/main/ROADMAP.md", external: true },
  ];

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground uppercase border-2 border-foreground px-2 py-0.5">
            EconoNigeria
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === link.href ? "text-foreground border-b border-foreground" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase border border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground"></span>
          </span>
          Live Data
        </div>
        <ThemeToggle />
        <a 
          href="https://github.com/israeleromon-lab/EcoNigeria" 
          target="_blank" 
          rel="noreferrer"
          className="hidden sm:flex h-9 px-4 border border-border items-center justify-center text-foreground hover:bg-muted transition-colors text-sm font-medium uppercase tracking-wider"
        >
          Source
        </a>
      </div>
    </header>
  );
}

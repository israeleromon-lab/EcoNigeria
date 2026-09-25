"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { MacroTickerTape } from "@/components/MacroTickerTape";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

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
    <div className="flex flex-col h-[100dvh] overflow-hidden w-full relative bg-background">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <MacroTickerTape />

      {/* Mobile Menu Overlay - Matte charcoal surface instead of blurry glassmorphism */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-background md:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="flex flex-col h-full pt-20 px-6 gap-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider font-mono">Navigation</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground p-2 text-xl font-mono">&times;</button>
          </div>
          
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className={cn(
                  "text-xl font-mono uppercase tracking-wider pb-2 border-b border-border/50 transition-colors hover:text-foreground",
                  pathname === link.href ? "text-emerald-400 border-emerald-500" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="terminal-scroll-root" className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        <div className="w-full mx-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { MacroTickerTape } from "@/components/MacroTickerTape";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu and scroll terminal container to top on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined" && !window.location.hash) {
      const scrollRoot = document.getElementById("terminal-scroll-root");
      scrollRoot?.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

  // Close drawer on Escape key & lock body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
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

      {/* Mobile & Tablet Menu Drawer Overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 lg:hidden transition-opacity duration-200",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={cn(
            "flex flex-col h-full w-full sm:max-w-sm bg-background dark:bg-[#0B0F17] border-r border-border dark:border-white/[0.12] overflow-y-auto p-5 sm:p-6 justify-between gap-6 transition-transform duration-200",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border dark:border-white/[0.08]">
              <div className="inline-flex items-center gap-2 text-base font-mono font-bold tracking-tight text-foreground uppercase border border-emerald-500/40 bg-emerald-500/[0.06] px-2.5 py-0.5">
                <span className="inline-block w-2 h-2 bg-emerald-500" />
                <span>EconoNigeria</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="text-muted-foreground hover:text-foreground p-2 border border-transparent hover:border-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center justify-between text-base sm:text-lg font-mono uppercase tracking-wider py-3 px-3 border-l-2 transition-colors hover:text-foreground hover:bg-muted/30",
                    pathname === link.href
                      ? "text-emerald-500 border-emerald-500 bg-emerald-500/[0.06] font-semibold"
                      : "text-muted-foreground border-transparent"
                  )}
                >
                  <span>{link.name}</span>
                  {link.external && <ExternalLink className="w-4 h-4 opacity-70" />}
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-border dark:border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider border border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Terminal Active · 12 Series</span>
            </div>
            <a
              href="https://github.com/israeleromon-lab/EcoNigeria"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-full px-3 border border-border dark:border-white/[0.12] items-center justify-center gap-2 text-foreground hover:bg-muted transition-colors text-xs font-mono uppercase tracking-wider"
            >
              <span>GitHub Source Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="terminal-scroll-root" className="flex-1 overflow-y-auto overflow-x-hidden bg-background scroll-smooth">
        <div className="w-full max-w-[1600px] mx-auto p-3 sm:p-5 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}



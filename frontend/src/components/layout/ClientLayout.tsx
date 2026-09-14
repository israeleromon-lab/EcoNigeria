"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { INDICATORS } from "@/lib/constants";

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
    { name: "API Docs", href: "https://github.com/israeleromon-lab/EconoNigeria/tree/main/docs", external: true },
    { name: "Methodology", href: "https://github.com/israeleromon-lab/EconoNigeria/blob/main/docs/methodology.md", external: true },
    { name: "Data Sources", href: "https://github.com/israeleromon-lab/EconoNigeria/blob/main/docs/data-sources.md", external: true },
    { name: "Roadmap", href: "https://github.com/israeleromon-lab/EconoNigeria/blob/main/ROADMAP.md", external: true },
  ];

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden w-full relative">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-background/95 backdrop-blur-md md:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className="flex flex-col h-full pt-20 px-6 gap-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider">Navigation</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground p-2 text-xl font-light">&times;</button>
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
                  "text-2xl font-medium pb-2 border-b border-border/50 transition-colors hover:text-foreground",
                  pathname === link.href ? "text-foreground border-foreground" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        <div className="w-full mx-auto p-4 sm:p-6 md:p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

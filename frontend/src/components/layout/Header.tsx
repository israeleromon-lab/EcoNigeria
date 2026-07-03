"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Public Open Source
        </div>
        <a 
          href="https://github.com/israeleromon-lab/EcoNigeria" 
          target="_blank" 
          rel="noreferrer"
          className="h-9 px-4 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          View Source
        </a>
      </div>
    </header>
  );
}

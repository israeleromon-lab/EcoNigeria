"use client";

import { Bell, Search, UserCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search indicators, news, reports..."
            className="w-full bg-background/50 pl-9 border-border/50 focus-visible:ring-primary/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-card"></span>
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors">
          <UserCircle className="w-5 h-5" />
        </div>
      </div>
    </header>
  );
}

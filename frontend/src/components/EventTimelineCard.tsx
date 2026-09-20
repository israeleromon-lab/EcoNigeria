"use client";

import { useState } from "react";
import { MACRO_EVENTS, MacroEvent, EventCategory } from "@/lib/events";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Milestone, 
  Eye, 
  EyeOff, 
  Calendar, 
  Sparkles, 
  Tag, 
  AlertCircle,
  TrendingDown
} from "lucide-react";

interface EventTimelineCardProps {
  indicatorSlug?: string;
  indicatorName?: string;
  showEvents: boolean;
  onToggleShowEvents: (val: boolean) => void;
  highlightedYear: string | null;
  onHighlightYear: (year: string | null) => void;
}

const CATEGORIES: ("All" | EventCategory)[] = [
  "All",
  "Structural Reform",
  "Monetary Policy",
  "Commodity Shock",
  "Fiscal Policy",
  "External Shock"
];

export function EventTimelineCard({
  indicatorSlug,
  indicatorName,
  showEvents,
  onToggleShowEvents,
  highlightedYear,
  onHighlightYear
}: EventTimelineCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | EventCategory>("All");
  const [filterForIndicatorOnly, setFilterForIndicatorOnly] = useState(false);

  // Filter events
  let filteredEvents = MACRO_EVENTS;
  if (filterForIndicatorOnly && indicatorSlug) {
    filteredEvents = filteredEvents.filter(e => e.indicators.includes(indicatorSlug));
  }
  if (selectedCategory !== "All") {
    filteredEvents = filteredEvents.filter(e => e.category === selectedCategory);
  }

  return (
    <Card className="border-border/60 bg-card/40 rounded-none shadow-none mt-6">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Milestone className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg font-bold uppercase tracking-wider">
                Macroeconomic Policy & Shock Timeline
              </CardTitle>
            </div>
            <CardDescription className="text-xs font-serif mt-1">
              Historical structural shifts, exchange rate interventions, and commodity shocks impacting Nigerian data.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleShowEvents(!showEvents)}
              className="rounded-none text-xs gap-1.5 font-mono"
            >
              {showEvents ? <Eye className="w-3.5 h-3.5 text-emerald-500" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
              {showEvents ? "Chart Milestones: ON" : "Chart Milestones: OFF"}
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-sans px-2.5 py-1 border transition-colors uppercase tracking-wider ${
                  selectedCategory === cat
                    ? "border-foreground bg-foreground text-background font-bold"
                    : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {indicatorSlug && (
            <button
              onClick={() => setFilterForIndicatorOnly(!filterForIndicatorOnly)}
              className={`text-[11px] font-mono underline underline-offset-4 transition-colors ${
                filterForIndicatorOnly ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filterForIndicatorOnly ? "Showing related to this metric" : "Filter by this metric"}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border text-muted-foreground text-sm font-serif">
            No policy events matched this specific filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((evt) => {
              const isHighlighted = highlightedYear === evt.year;
              const isDirectlyRelated = indicatorSlug && evt.indicators.includes(indicatorSlug);

              return (
                <div
                  key={evt.id}
                  onMouseEnter={() => onHighlightYear(evt.year)}
                  onMouseLeave={() => onHighlightYear(null)}
                  onClick={() => onHighlightYear(isHighlighted ? null : evt.year)}
                  className={`p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    isHighlighted
                      ? "border-foreground bg-muted/40 shadow-sm"
                      : "border-border/60 bg-background/60 hover:border-foreground/60 hover:bg-muted/10"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-1.5 py-0.5 bg-foreground text-background">
                          {evt.year}
                        </span>
                        <span className="font-serif text-[11px] text-muted-foreground">
                          {evt.date}
                        </span>
                      </div>
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border"
                        style={{ borderColor: evt.color, color: evt.color }}
                      >
                        {evt.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm tracking-tight text-foreground font-sans mt-1">
                      {evt.title}
                    </h4>

                    <p className="font-serif text-xs leading-relaxed text-muted-foreground mt-2">
                      {evt.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[10px] font-mono">
                    <span className="text-muted-foreground">
                      Related: {evt.indicators.slice(0, 3).join(", ")}{evt.indicators.length > 3 ? "..." : ""}
                    </span>
                    {isDirectlyRelated && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        ★ High Relevance
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

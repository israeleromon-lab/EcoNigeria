"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSystemStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import Link from "next/link";

interface EconomicPulseCardProps {
  initialData?: any;
}

export function EconomicPulseCard({ initialData }: EconomicPulseCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["system_status"],
    queryFn: fetchSystemStatus,
    initialData: initialData,
  });

  const pulse = data?.economic_pulse;

  if (isLoading) {
    return (
      <Card className="border-2 border-foreground bg-background p-6 rounded-none">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-14 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Card>
    );
  }

  if (!pulse) return null;

  const getRatingStyle = (rating: string) => {
    switch (rating) {
      case "Resilient":
        return {
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          bar: "bg-emerald-500",
          text: "text-emerald-600 dark:text-emerald-400",
        };
      case "Moderate":
        return {
          badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          bar: "bg-blue-500",
          text: "text-blue-600 dark:text-blue-400",
        };
      case "Strained":
        return {
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          bar: "bg-amber-500",
          text: "text-amber-600 dark:text-amber-400",
        };
      case "Vulnerable":
      default:
        return {
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          bar: "bg-rose-500",
          text: "text-rose-600 dark:text-rose-400",
        };
    }
  };

  const style = getRatingStyle(pulse.rating);

  return (
    <Card className="border-2 border-foreground bg-background rounded-none shadow-none relative overflow-hidden">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-foreground text-background">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold uppercase tracking-wider">
                Nigeria Economic Pulse
              </CardTitle>
              <p className="text-xs text-muted-foreground font-serif">
                Composite macroeconomic health index (0–100)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${style.badge}`}
            >
              {pulse.rating}
            </span>
            <Link
              href="/status"
              className="text-xs text-muted-foreground hover:text-foreground font-serif underline underline-offset-2 transition-colors"
            >
              Data Status →
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Score Display */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-border pb-4 md:pb-0 md:pr-6">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-extrabold font-serif ${style.text}`}>
                {pulse.score}
              </span>
              <span className="text-muted-foreground text-xl font-serif">/ 100</span>
            </div>

            {/* Visual Gauge Meter */}
            <div className="w-full bg-muted/40 h-2 overflow-hidden border border-border/40">
              <div
                className={`h-full ${style.bar} transition-all duration-700`}
                style={{ width: `${pulse.score}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
              Evaluated against multi-decade baseline
            </p>
          </div>

          {/* Qualitative Synthesis */}
          <div className="md:col-span-2 space-y-3">
            <p className="font-serif text-sm md:text-base leading-relaxed text-foreground/90">
              {pulse.summary}
            </p>

            {/* Key Macro Drivers */}
            {pulse.drivers && pulse.drivers.length > 0 && (
              <div className="pt-2 border-t border-border/50">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block mb-2">
                  Key Macro Drivers & Pressure Points
                </span>
                <div className="flex flex-wrap gap-2">
                  {pulse.drivers.map((driver: any, i: number) => {
                    const isDrag = driver.direction === "drag";
                    const isSupport = driver.direction === "support";
                    return (
                      <div
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted/20 border border-border text-xs font-serif"
                      >
                        {isDrag && <TrendingDown className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                        {isSupport && <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                        {!isDrag && !isSupport && <Minus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                        <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {driver.indicator}:
                        </span>
                        <span className="font-medium text-foreground">{driver.impact}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-border text-[11px] text-muted-foreground font-serif">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            The Economic Pulse combines inflation, currency stability, GDP growth, and debt sustainability. Updated automatically upon new official observations.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

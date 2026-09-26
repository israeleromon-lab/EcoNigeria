"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSystemStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BorderBeam } from "@/components/magicui/BorderBeam";
import { NumberTicker } from "@/components/magicui/NumberTicker";
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
      <Card className="border border-border dark:border-white/[0.12] bg-card dark:bg-[#111622] p-6 rounded-none">
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

  // Semantic signal colors strictly tied to Nigeria's macro status:
  // - Emerald (#10b981): Resilient / Expansionary
  // - Amber (#f59e0b): Moderate Pressure / Stagnation
  // - Crimson/Rose (#f43f5e): High Volatility / Critical Distress
  const getRatingStyle = (rating: string) => {
    switch (rating) {
      case "Resilient":
        return {
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          bar: "bg-[#10b981]",
          text: "text-emerald-600 dark:text-[#10b981]",
          hex: "#10b981",
        };
      case "Moderate":
      case "Strained":
        return {
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          bar: "bg-[#f59e0b]",
          text: "text-amber-600 dark:text-[#f59e0b]",
          hex: "#f59e0b",
        };
      case "Vulnerable":
      default:
        return {
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          bar: "bg-[#f43f5e]",
          text: "text-rose-600 dark:text-[#f43f5e]",
          hex: "#f43f5e",
        };
    }
  };

  const style = getRatingStyle(pulse.rating);

  return (
    <Card className="border border-border dark:border-white/[0.12] bg-card dark:bg-[#111622] rounded-none shadow-none relative overflow-hidden">
      {/* Single Institutional Anchor: Semantic BorderBeam strictly isolated to EconomicPulseCard */}
      <BorderBeam status={pulse.rating} duration={12} colorOverride={style.hex} />

      <CardHeader className="border-b border-border dark:border-white/[0.08] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <span
              className="p-1.5 border border-white/10 shrink-0 mt-0.5 sm:mt-0"
              style={{ backgroundColor: `${style.hex}1A`, color: style.hex }}
            >
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <CardTitle className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider leading-snug">
                Nigeria Economic Pulse // Composite Index
              </CardTitle>
              <p className="text-xs text-muted-foreground font-serif mt-0.5">
                Real-time macroeconomic health diagnostic (0–100 scale)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider border ${style.badge}`}
            >
              STATUS: {pulse.rating}
            </span>
            <Link
              href="/status"
              className="text-xs text-muted-foreground hover:text-foreground font-mono uppercase tracking-wider underline underline-offset-4 transition-colors"
            >
              Pipeline Telemetry →
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 sm:pt-6 space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-center">
          {/* Score Display with Tabular Spring Roll */}
          <div className="space-y-2.5 border-b md:border-b-0 md:border-r border-border dark:border-white/[0.08] pb-4 md:pb-0 md:pr-6">
            <div className="flex items-baseline gap-2">
              <NumberTicker
                value={Number(pulse.score)}
                decimals={0}
                className={`text-4xl sm:text-5xl font-bold font-mono tabular-nums lining-nums ${style.text}`}
              />
              <span className="text-muted-foreground text-base sm:text-lg font-mono tabular-nums">/ 100</span>
            </div>

            {/* Visual Gauge Meter */}
            <div className="w-full bg-muted/40 dark:bg-[#0B0F17] h-2 overflow-hidden border border-border/60 dark:border-white/[0.08]">
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
              <div className="pt-2 border-t border-border/50 dark:border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-muted-foreground block mb-2">
                  Key Macro Drivers &amp; Pressure Points
                </span>
                <div className="flex flex-wrap gap-2">
                  {pulse.drivers.map((driver: any, i: number) => {
                    const isDrag = driver.direction === "drag";
                    const isSupport = driver.direction === "support";
                    return (
                      <div
                        key={i}
                        className="inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 bg-background dark:bg-[#0B0F17] border border-border dark:border-white/[0.08] text-xs font-mono max-w-full"
                      >
                        {isDrag && <TrendingDown className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />}
                        {isSupport && <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                        {!isDrag && !isSupport && <Minus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {driver.indicator}:
                        </span>
                        <span className="font-semibold text-foreground">{driver.impact}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start sm:items-center gap-2 pt-3 border-t border-border dark:border-white/[0.08] text-[10px] sm:text-[11px] text-muted-foreground font-mono leading-relaxed">
          <Info className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500 mt-0.5 sm:mt-0" />
          <span>
            COMPOSITE WEIGHTING: CPI INFLATION · FX STABILITY · REAL GDP GROWTH · SOVEREIGN DEBT SUSTAINABILITY
          </span>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEconomicSignals } from "@/lib/api";
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Radio, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

interface Signal {
  id: string;
  title: string;
  category: string;
  severity: "critical" | "warning" | "positive" | "info";
  indicator_name: string;
  metric_value: string;
  benchmark: string;
  summary: string;
  implication: string;
  detected_at?: string;
}

export function EconomicSignalsBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["economic_signals"],
    queryFn: fetchEconomicSignals,
    refetchInterval: 60000,
  });

  const signals: Signal[] = data?.signals || [];

  if (isLoading || isError || signals.length === 0) {
    return null;
  }

  const criticalCount = signals.filter((s) => s.severity === "critical").length;
  const warningCount = signals.filter((s) => s.severity === "warning").length;
  const positiveCount = signals.filter((s) => s.severity === "positive").length;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          badge: "bg-destructive text-destructive-foreground",
          border: "border-destructive/40",
          icon: <AlertOctagon className="w-4 h-4 text-destructive shrink-0" />,
          tag: "CRITICAL ALERT",
        };
      case "warning":
        return {
          badge: "bg-amber-500 text-white dark:bg-amber-600",
          border: "border-amber-500/40",
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
          tag: "ELEVATED VULNERABILITY",
        };
      case "positive":
        return {
          badge: "bg-emerald-600 text-white",
          border: "border-emerald-600/40",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          tag: "POSITIVE STABILIZER",
        };
      default:
        return {
          badge: "bg-muted text-muted-foreground",
          border: "border-border",
          icon: <Info className="w-4 h-4 text-muted-foreground shrink-0" />,
          tag: "STRUCTURAL NOTICE",
        };
    }
  };

  const primarySignal = signals[0];
  const primaryStyle = getSeverityStyle(primarySignal.severity);

  return (
    <div className="border-4 border-foreground bg-background p-3.5 sm:p-5 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-foreground pb-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
          </span>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-foreground animate-pulse shrink-0" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest text-foreground">
              Automated Macroeconomic Signals Engine
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/30">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              {warningCount} Warning
            </span>
          )}
          {positiveCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              {positiveCount} Stabilizer
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider hover:bg-muted px-2.5 py-1 border border-border transition-colors ml-auto sm:ml-1"
          >
            {isExpanded ? (
              <>
                Collapse <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                View All ({signals.length}) <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary / Active Lead Signal */}
      <div className="mt-4 pt-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{primaryStyle.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 ${primaryStyle.badge}`}>
                  {primaryStyle.tag}
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {primarySignal.category} • {primarySignal.indicator_name}
                </span>
              </div>
              <h3 className="text-base md:text-lg font-bold uppercase tracking-tight text-foreground">
                {primarySignal.title}
              </h3>
              <p className="text-xs sm:text-sm font-serif text-muted-foreground mt-1 leading-relaxed">
                {primarySignal.summary}{" "}
                <strong className="text-foreground font-semibold">Policy Implication:</strong> {primarySignal.implication}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap sm:flex-nowrap lg:flex-col items-baseline lg:items-end justify-between gap-2 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6">
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Current Metric
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-foreground">
              {primarySignal.metric_value}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground w-full sm:w-auto text-right lg:text-right">
              {primarySignal.benchmark}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Signal Grid */}
      {isExpanded && (
        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.slice(1).map((sig) => {
            const style = getSeverityStyle(sig.severity);
            return (
              <div
                key={sig.id}
                className={`p-3.5 sm:p-4 border bg-muted/20 flex flex-col justify-between ${style.border}`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 ${style.badge}`}>
                      {style.tag}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-foreground">
                      {sig.metric_value}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-tight text-foreground flex items-start gap-1.5">
                    <span className="mt-0.5">{style.icon}</span>
                    <span>{sig.title}</span>
                  </h4>
                  <p className="text-xs font-serif text-muted-foreground mt-2 leading-relaxed">
                    {sig.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">Benchmark:</span> {sig.benchmark}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link to Research Hub */}
      <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
        <span>Scanned continuously against verified database records</span>
        <Link 
          href="/research" 
          className="hover:text-foreground inline-flex items-center gap-1 font-bold underline underline-offset-4 self-start sm:self-auto"
        >
          Synthesize in Research Hub <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

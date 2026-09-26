"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData, fetchIndicatorData, warmBackendPing } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { getSourceAbbreviation } from "@/components/ui/SourceBadge";
import { InlineSparkline } from "@/components/ui/InlineSparkline";
import { NumberTicker } from "@/components/magicui/NumberTicker";
import { cn, formatIndicatorValue, formatInlineDelta } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowUpRight,
  Crosshair,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { AIAnalystCard } from "@/components/AIAnalystCard";
import { EconomicPulseCard } from "@/components/EconomicPulseCard";
import { EconomicSignalsBanner } from "@/components/EconomicSignalsBanner";
import { ForecastChart } from "@/components/ForecastChart";

const LOADING_TIMEOUT_MS = 9000;

export default function Dashboard() {
  const [focusedSlug, setFocusedSlug] = useState<string>("inflation");
  const [flashCardSlug, setFlashCardSlug] = useState<string | null>(null);
  const [loadingTimedOut, setLoadingTimedOut] = useState<boolean>(false);

  // Lightweight warm ping on mount to wake cold-starting Render backend
  useEffect(() => {
    warmBackendPing();
  }, []);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  // After 9 seconds of waiting on a cold backend, surface a friendly retry state
  useEffect(() => {
    if (!isLoading) {
      setLoadingTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
    }, LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const focusedIndicator =
    INDICATORS.find((i) => i.slug === focusedSlug) || INDICATORS[2];

  // Fetch historical series for the active Primary Metric Chart HUD on the dashboard
  const { data: focusedHistData, isLoading: isFocusedChartLoading } = useQuery({
    queryKey: ["indicator", focusedIndicator.id],
    queryFn: () => fetchIndicatorData(focusedIndicator.id),
  });

  // Listen for MacroTickerTape HUD clicks (`econonigeria:select-metric`) and URL `?metric=`
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const metricParam = params.get("metric");
      if (metricParam && INDICATORS.some((i) => i.slug === metricParam)) {
        setFocusedSlug(metricParam);
      }
    }

    const handleSelectMetric = (e: Event) => {
      const custom = e as CustomEvent<{ code: string; slug: string }>;
      if (custom.detail?.slug) {
        setFocusedSlug(custom.detail.slug);
        setFlashCardSlug(custom.detail.slug);
        setTimeout(() => {
          setFlashCardSlug((prev) =>
            prev === custom.detail.slug ? null : prev
          );
        }, 900);
      }
    };

    window.addEventListener("econonigeria:select-metric", handleSelectMetric);
    return () => {
      window.removeEventListener(
        "econonigeria:select-metric",
        handleSelectMetric
      );
    };
  }, []);

  const focusedChartPoints =
    focusedHistData?.data
      ?.map((d: any) => ({
        year: d.period,
        value: d.value,
      }))
      .sort((a: any, b: any) => Number(a.year) - Number(b.year)) || [];

  return (
    <div className="space-y-10">
      {/* Editorial Terminal Masthead */}
      <div className="border-b border-border dark:border-white/[0.12] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            <span>NGA // SOVEREIGN MACRO TERMINAL</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">12 VERIFIED SERIES</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">
            The open intelligence layer for Nigeria&apos;s economy.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 font-serif italic max-w-3xl">
            Explore verified official time series, inspect trailing trajectories,
            analyze structural drivers, and model forward scenarios.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground shrink-0">
          <Link
            href="/methodology"
            className="px-2.5 py-1 border border-border dark:border-white/[0.08] bg-card dark:bg-[#111622] hover:border-foreground transition-colors"
          >
            SOURCES: CBN · NBS · DMO · FRED · WB &rarr;
          </Link>
        </div>
      </div>

      {/* Single Institutional Anchor with Semantic BorderBeam */}
      <EconomicPulseCard />

      <EconomicSignalsBanner />

      {(isError || loadingTimedOut) && (
        <div className="p-4 bg-card dark:bg-[#111622] text-foreground border border-amber-500/30 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="text-amber-500 font-semibold uppercase tracking-wider mr-2">
                {loadingTimedOut && !isError
                  ? "BACKEND COLD-START TIMEOUT //"
                  : "LIVE TELEMETRY OFFLINE //"}
              </span>
              <span className="text-muted-foreground font-sans">
                Displaying verified institutional baseline while the Render data server wakes up (30–50s on cold start).
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoadingTimedOut(false);
              warmBackendPing();
              refetch();
            }}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/50 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-mono text-[11px] uppercase tracking-wider transition-colors shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3 h-3", isFetching && "animate-spin")} />
            {isFetching ? "Reconnecting..." : "Retry Connection"}
          </button>
        </div>
      )}

      {/* 12-Indicator Anti-Vibe Macro Grid (Always rendered in SSR & Client with Verified Provenance) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-0.5">
          <span>
            MACROECONOMIC KPI MATRIX //{" "}
            {isLoading && !loadingTimedOut
              ? "VERIFIED BASELINE LOADED — SYNCING LIVE TELEMETRY..."
              : isError || loadingTimedOut
              ? "OFFLINE SNAPSHOT — VERIFIED INSTITUTIONAL BASELINE"
              : "LIVE DB TELEMETRY & TRAILING 15-OBSERVATION SPARKLINES"}
          </span>
          <span className="hidden sm:inline">
            CLICK CARD OR HUD ICON TO SNAP PRIMARY CHART
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 border-l border-t border-border dark:border-white/[0.08]">
          {INDICATORS.map((indicator) => {
            const stat = data?.indicators?.find(
              (d: any) => d.code === indicator.id
            );

            const displayValue =
              stat?.current_value ?? indicator.baselineValue ?? null;
            const displayPeriod =
              stat?.current_period ?? indicator.baselinePeriod;

            const delta = formatInlineDelta({
              currentValue: stat?.current_value,
              previousValue: stat?.previous_value,
              pctChange: stat?.pct_change,
              bpsChange: stat?.bps_change,
              unit: indicator.unit,
              frequency: stat?.native_frequency,
              indicatorCode: indicator.id,
            });

            const sourceAbbr = stat?.source
              ? getSourceAbbreviation(stat.source)
              : indicator.publisher.split("/")[0].trim();

            const sparklineSeries =
              stat?.sparkline_points && stat.sparkline_points.length > 0
                ? stat.sparkline_points
                : stat?.sparkline && stat.sparkline.length > 0
                ? stat.sparkline
                : stat?.sparkline_values || [];

            const isFocused = focusedSlug === indicator.slug;
            const isFlashed = flashCardSlug === indicator.slug;

            return (
              <div
                key={indicator.id}
                id={`kpi-${indicator.slug}`}
                className={cn(
                  "bg-card dark:bg-[#0B0F17] border-r border-b border-border dark:border-white/[0.08] hover:border-foreground/30 dark:hover:border-white/[0.18] dark:hover:bg-[#111622]/70 transition-colors duration-150 p-4 flex flex-col justify-between relative h-full",
                  isFocused &&
                    "bg-emerald-500/[0.03] dark:bg-[#111622] ring-1 ring-inset ring-emerald-500/40",
                  isFlashed &&
                    "ring-2 ring-inset ring-emerald-400 bg-emerald-500/10"
                )}
              >
                {/* 1. Uppercase Monospace Metric Header + Series Code + HUD Chart Trigger */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Link
                      href={`/${indicator.slug}`}
                      className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase hover:text-foreground transition-colors leading-tight font-semibold"
                    >
                      {indicator.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedSlug(indicator.slug);
                        const chartEl = document.getElementById(
                          "dashboard-primary-chart"
                        );
                        chartEl?.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                        });
                      }}
                      title={`Snap ${indicator.name} to Primary Chart HUD`}
                      className={cn(
                        "p-1 border text-[10px] font-mono transition-colors shrink-0",
                        isFocused
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                          : "border-transparent text-muted-foreground/60 hover:text-foreground hover:border-white/10"
                      )}
                    >
                      <Crosshair className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground/75 mb-2">
                    {indicator.id}
                  </div>

                  {/* 2. Big Primary Tabular Monospace Value + Inline Delta Badge */}
                  <div className="flex items-baseline justify-between gap-2 flex-wrap my-1">
                    <Link
                      href={`/${indicator.slug}`}
                      className="text-2xl xl:text-[25px] font-bold text-foreground font-mono tabular-nums lining-nums tracking-tight"
                    >
                      {displayValue != null ? (
                        <NumberTicker
                          value={Number(displayValue)}
                          formatter={(val) =>
                            formatIndicatorValue(val, indicator.unit)
                          }
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </Link>

                    {stat?.current_value != null &&
                      stat?.previous_value != null && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-semibold border",
                            delta.badgeClass
                          )}
                        >
                          <span>{delta.icon}</span>
                          <span>{delta.text}</span>
                        </span>
                      )}
                  </div>
                </div>

                {/* 3. Tight, Unembellished 40px Inline SVG Sparkline */}
                <div className="my-3">
                  <InlineSparkline
                    data={sparklineSeries}
                    color="#10b981"
                    height={40}
                  />
                </div>

                {/* 4. Footnote Citing Source Entity, Period & 1-Click Verification */}
                <div className="pt-2.5 border-t border-border/60 dark:border-white/[0.06] flex items-center justify-between gap-1 text-[10px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <a
                      href={indicator.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Verify ${indicator.name} at ${indicator.publisher}`}
                      className="font-semibold text-foreground/85 hover:underline inline-flex items-center gap-0.5"
                    >
                      {sourceAbbr}
                      <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                    </a>
                    <span className="text-muted-foreground/50">·</span>
                    <span>
                      {(
                        stat?.native_frequency ||
                        indicator.nativeFrequency.split(" ")[0]
                      ).toUpperCase()}
                    </span>
                    <span className="text-muted-foreground/50">·</span>
                    <span>{displayPeriod}</span>
                  </div>

                  {stat?.is_stale ? (
                    <span
                      title={`Latest observation (${displayPeriod}) exceeds freshness threshold`}
                      className="inline-flex items-center gap-0.5 px-1 py-0 text-[9px] font-mono uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-500 shrink-0"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      LAG
                    </span>
                  ) : (
                    <Link
                      href={`/${indicator.slug}`}
                      className="inline-flex items-center text-muted-foreground hover:text-emerald-400 transition-colors shrink-0"
                      title={`Open full ${indicator.name} workbench`}
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Intelligence Split: AI Analyst + Active Primary Metric Chart HUD */}
      <div
        id="dashboard-primary-chart"
        className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border dark:border-white/[0.08] bg-card dark:bg-[#0B0F17]"
      >
        <div className="border-b lg:border-b-0 lg:border-r border-border dark:border-white/[0.08] p-6 md:p-8 bg-card dark:bg-[#0B0F17]">
          <AIAnalystCard />
        </div>

        <div className="p-6 md:p-8 bg-card dark:bg-[#111622]/50 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border dark:border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-emerald-500 mb-1">
                <span>ACTIVE TERMINAL HUD // PRIMARY CHART</span>
                <span>·</span>
                <span>{focusedIndicator.id}</span>
                <span>·</span>
                <span>{focusedIndicator.publisher}</span>
              </div>
              <h2 className="text-xl font-bold uppercase tracking-tight">
                {focusedIndicator.name} — Empirical Series &amp; Forecast
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/${focusedIndicator.slug}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase tracking-wider border border-border dark:border-white/[0.12] hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                Full Workbench <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metric Switcher Strip */}
          <div className="flex flex-wrap gap-1.5">
            {INDICATORS.map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => setFocusedSlug(ind.slug)}
                className={cn(
                  "px-2 py-1 text-[10px] font-mono uppercase tracking-wider border transition-colors",
                  focusedSlug === ind.slug
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold"
                    : "border-border dark:border-white/[0.08] bg-background dark:bg-[#0B0F17] text-muted-foreground hover:text-foreground"
                )}
              >
                {ind.name}
              </button>
            ))}
          </div>

          {/* Embedded Live ForecastChart for Selected Indicator */}
          <div className="flex-1 min-h-[340px]">
            {isFocusedChartLoading ? (
              <Skeleton className="w-full h-[340px] rounded-none" />
            ) : focusedChartPoints.length > 0 ? (
              <ForecastChart
                indicatorCode={focusedIndicator.id}
                indicatorName={focusedIndicator.name}
                indicatorSlug={focusedIndicator.slug}
                unit={focusedIndicator.unit}
                historicalData={focusedChartPoints}
                color="#10b981"
                showEvents={false}
                highlightedYear={null}
              />
            ) : (
              <div className="h-[340px] flex items-center justify-center border border-dashed border-white/10 font-mono text-xs text-muted-foreground">
                SELECT AN INDICATOR TO INSPECT TRAJECTORY
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

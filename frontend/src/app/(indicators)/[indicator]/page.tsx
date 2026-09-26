"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchIndicatorData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ForecastChart } from "@/components/ForecastChart";
import { EventTimelineCard } from "@/components/EventTimelineCard";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StaleWarning } from "@/components/ui/StaleWarning";
import { MethodologyDialog } from "@/components/MethodologyDialog";
import {
  Download,
  FileJson,
  AlertCircle,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  GitCommit,
  ShieldCheck,
} from "lucide-react";
import { formatIndicatorValue } from "@/lib/utils";
import Link from "next/link";

export default function IndicatorPage() {
  const [showEvents, setShowEvents] = useState(true);
  const [highlightedYear, setHighlightedYear] = useState<string | null>(null);

  const params = useParams();
  const slug = params.indicator as string;

  const indicatorConfig = INDICATORS.find((i) => i.slug === slug);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["indicator", indicatorConfig?.id],
    queryFn: () =>
      indicatorConfig
        ? fetchIndicatorData(indicatorConfig.id)
        : Promise.reject("No config"),
    enabled: !!indicatorConfig,
  });

  if (!indicatorConfig) {
    return notFound();
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Failed to load data</h2>
        <p className="text-muted-foreground mt-2">
          Could not fetch data for {indicatorConfig.name}
        </p>
      </div>
    );
  }

  // Format data for chart
  const chartData =
    data?.data
      ?.map((d: any) => ({
        year: d.period,
        value: d.value,
      }))
      .sort((a: any, b: any) => Number(a.year) - Number(b.year)) || [];

  const validData = chartData.filter(
    (d: any) => d.value !== null && d.value !== undefined
  );
  const latestValue =
    validData.length > 0
      ? validData[validData.length - 1].value
      : indicatorConfig.baselineValue;
  const latestYear =
    validData.length > 0
      ? validData[validData.length - 1].year
      : indicatorConfig.baselinePeriod;

  // Compute empirical summary metrics for the grounded macro summary
  const prevEntry = validData.length >= 2 ? validData[validData.length - 2] : null;
  const tenYrEntry =
    validData.length >= 10
      ? validData[validData.length - 10]
      : validData[0] || null;

  let peakEntry = validData[0] || null;
  let troughEntry = validData[0] || null;
  for (const pt of validData) {
    if (peakEntry && Number(pt.value) > Number(peakEntry.value)) peakEntry = pt;
    if (troughEntry && Number(pt.value) < Number(troughEntry.value))
      troughEntry = pt;
  }

  // Determine staleness: if latest data is > 2 years old
  const currentYear = new Date().getFullYear();
  const dataYear = latestYear ? parseInt(String(latestYear).slice(0, 4), 10) : 0;
  const isStale = dataYear > 0 && currentYear - dataYear > 2;

  const source = data?.source || indicatorConfig.publisher;
  const frequency = data?.native_frequency || indicatorConfig.nativeFrequency;

  const handleExportCSV = () => {
    if (!validData || validData.length === 0) return;

    const headers = [
      "Period",
      "Value",
      "Unit",
      "Indicator_Code",
      "Publisher",
      "Base_Year",
      "Primary_Source_URL",
    ];
    const csvContent = [
      headers.join(","),
      ...validData.map(
        (row: any) =>
          `${row.year},${row.value},"${indicatorConfig.unit}","${indicatorConfig.id}","${indicatorConfig.publisher}","${indicatorConfig.baseYear}","${indicatorConfig.sourceUrl}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${indicatorConfig.slug}_verified_series.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!validData || validData.length === 0) return;

    const payload = {
      indicator_code: indicatorConfig.id,
      slug: indicatorConfig.slug,
      name: indicatorConfig.name,
      unit: indicatorConfig.unit,
      provenance: {
        primary_publisher: indicatorConfig.publisher,
        publication_name: indicatorConfig.publicationName,
        primary_source_url: indicatorConfig.sourceUrl,
        native_frequency: frequency,
        release_cadence: indicatorConfig.releaseCadence,
        base_year: indicatorConfig.baseYear,
        structural_break_note: indicatorConfig.structuralBreakNote || null,
      },
      exported_at: new Date().toISOString(),
      total_observations: validData.length,
      observations: validData.map((row: any) => ({
        period: String(row.year),
        value: Number(row.value),
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${indicatorConfig.slug}_verified_series.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Stale data banner */}
      {isStale && !isLoading && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-sm font-serif text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            The latest available observation for this indicator is from{" "}
            <strong>{latestYear}</strong> ({indicatorConfig.releaseCadence}).
            Refer to{" "}
            <a
              href={indicatorConfig.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              {indicatorConfig.publisher}
            </a>{" "}
            for interim releases.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 sm:mb-6 font-serif transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center border border-border bg-muted px-2.5 py-0.5 text-xs font-mono font-bold text-foreground">
              {indicatorConfig.id}
            </div>
            <SourceBadge source={indicatorConfig.publisher.split("/")[0].trim()} />
            <span className="text-xs font-mono text-muted-foreground">
              {indicatorConfig.publicationName}
            </span>
            <MethodologyDialog
              indicatorName={indicatorConfig.name}
              methodology={indicatorConfig.methodology}
              source={source}
              frequency={frequency}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {indicatorConfig.name}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 font-serif">
            Verified historical series, econometric ensemble forecast (with 80%
            CI &amp; holdout backtest), and primary institutional provenance.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial gap-2 rounded-none font-mono text-xs uppercase tracking-wider"
            onClick={handleExportCSV}
            disabled={!validData || validData.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial gap-2 rounded-none font-mono text-xs uppercase tracking-wider"
            onClick={handleExportJSON}
            disabled={!validData || validData.length === 0}
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Methodological Discontinuity / Structural Break Callout (if applicable) */}
      {indicatorConfig.structuralBreakNote && (
        <div className="p-3.5 sm:p-4 border-l-4 border-amber-500 bg-amber-500/[0.06] border border-amber-500/20 flex items-start gap-3">
          <GitCommit className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Methodological &amp; Structural Break Disclosure ({indicatorConfig.baseYear})
            </div>
            <p className="font-serif text-foreground/85 leading-relaxed">
              {indicatorConfig.structuralBreakNote}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50 rounded-none">
            <CardHeader>
              <CardTitle>Empirical Trend &amp; 5-Year Ensemble Forecast</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Value over time ({indicatorConfig.unit}) — Solid line denotes
                verified institutional observations; dashed line &amp; band denote
                out-of-sample ML projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/10 border border-border text-sm font-serif text-muted-foreground">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-foreground"></span>
                    </span>
                    <span className="animate-pulse">
                      Synchronizing historical series from EconoNigeria backend...
                    </span>
                  </div>
                  <Skeleton className="w-full h-[280px] sm:h-[350px] rounded-none" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-[280px] sm:h-[350px] flex items-center justify-center border border-dashed rounded-none text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ForecastChart
                  indicatorCode={indicatorConfig.id}
                  indicatorName={indicatorConfig.name}
                  indicatorSlug={indicatorConfig.slug}
                  unit={indicatorConfig.unit}
                  historicalData={chartData}
                  color={indicatorConfig.color}
                  showEvents={showEvents}
                  highlightedYear={highlightedYear}
                />
              )}
            </CardContent>
          </Card>

          {/* Macroeconomic Event Timeline */}
          <EventTimelineCard
            indicatorSlug={indicatorConfig.slug}
            indicatorName={indicatorConfig.name}
            showEvents={showEvents}
            onToggleShowEvents={setShowEvents}
            highlightedYear={highlightedYear}
            onHighlightYear={setHighlightedYear}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 self-start">
          <Card className="bg-card/50 border-border/50 rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Latest Verified Observation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground font-mono tabular-nums">
                    {latestValue != null
                      ? formatIndicatorValue(
                          Number(latestValue),
                          indicatorConfig.unit
                        )
                      : "N/A"}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-2">
                    Observation Period: <strong>{latestYear || "N/A"}</strong> ·{" "}
                    {indicatorConfig.publisher}
                  </p>
                  {isStale && (
                    <StaleWarning
                      period={String(latestYear || "unknown")}
                      frequency={frequency}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Granular 1-Click Institutional Provenance Card */}
          <Card className="bg-card/50 border-border/50 rounded-none">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center justify-between">
                <span>Institutional Provenance</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Primary Authority</span>
                <span className="font-mono font-semibold text-foreground text-right">
                  {indicatorConfig.publisher}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Series Code</span>
                <span className="font-mono text-foreground text-right break-all">
                  {indicatorConfig.id}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Native Cadence</span>
                <span className="font-mono text-foreground text-right">
                  {indicatorConfig.nativeFrequency}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Release Schedule</span>
                <span className="font-mono text-muted-foreground text-right">
                  {indicatorConfig.releaseCadence}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Base / Valuation</span>
                <span className="font-mono text-muted-foreground text-right">
                  {indicatorConfig.baseYear}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-muted-foreground shrink-0">Verified Observations</span>
                <span className="font-mono font-semibold text-foreground text-right">
                  {validData.length > 0 ? validData.length : "50+ (Annual)"}
                </span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <a
                  href={indicatorConfig.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border hover:border-foreground text-foreground font-mono text-[11px] uppercase tracking-wider transition-colors text-center"
                >
                  <span>Verify at Primary Source ({indicatorConfig.publisher.split("/")[0].trim()})</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Clearly Demarcated Machine-Generated Macro Summary */}
          <Card className="bg-primary/5 border-primary/20 rounded-none md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-primary mb-1">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                <span>MACHINE-GENERATED MACRO SUMMARY</span>
              </div>
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground">
                Grounded on Verified NBS / CBN / WB Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed font-serif text-foreground/85">
              {validData.length >= 2 && peakEntry && troughEntry ? (
                <>
                  <p>
                    Across <strong>{validData.length}</strong> verified observations (
                    {validData[0].year}&ndash;{latestYear}),{" "}
                    <strong>{indicatorConfig.name}</strong> recorded a historical peak of{" "}
                    <strong>
                      {formatIndicatorValue(
                        Number(peakEntry.value),
                        indicatorConfig.unit
                      )}
                    </strong>{" "}
                    in <strong>{peakEntry.year}</strong> and a trough of{" "}
                    <strong>
                      {formatIndicatorValue(
                        Number(troughEntry.value),
                        indicatorConfig.unit
                      )}
                    </strong>{" "}
                    in <strong>{troughEntry.year}</strong>.
                  </p>
                  {prevEntry && (
                    <p>
                      The latest verified observation in <strong>{latestYear}</strong>{" "}
                      stood at{" "}
                      <strong>
                        {formatIndicatorValue(
                          Number(latestValue),
                          indicatorConfig.unit
                        )}
                      </strong>{" "}
                      (compared to{" "}
                      <strong>
                        {formatIndicatorValue(
                          Number(prevEntry.value),
                          indicatorConfig.unit
                        )}
                      </strong>{" "}
                      in {prevEntry.year}
                      {tenYrEntry
                        ? ` and ${formatIndicatorValue(
                            Number(tenYrEntry.value),
                            indicatorConfig.unit
                          )} in ${tenYrEntry.year}`
                        : ""}
                      ).
                    </p>
                  )}
                </>
              ) : (
                <p>{indicatorConfig.methodology}</p>
              )}
              <div className="pt-2 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                Note: Automated statistical synthesis. Cite raw CSV/JSON exports or{" "}
                {indicatorConfig.publisher} primary releases in academic publications.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

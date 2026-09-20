"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchIndicatorData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ForecastChart } from "@/components/ForecastChart";
import { EventTimelineCard } from "@/components/EventTimelineCard";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { StaleWarning } from "@/components/ui/StaleWarning";
import { MethodologyDialog } from "@/components/MethodologyDialog";
import { Download, AlertCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { formatIndicatorValue } from "@/lib/utils";
import Link from "next/link";

export default function IndicatorPage() {
  const [showEvents, setShowEvents] = useState(true);
  const [highlightedYear, setHighlightedYear] = useState<string | null>(null);

  const params = useParams();
  const slug = params.indicator as string;
  
  const indicatorConfig = INDICATORS.find(i => i.slug === slug);
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["indicator", indicatorConfig?.id],
    queryFn: () => indicatorConfig ? fetchIndicatorData(indicatorConfig.id) : Promise.reject("No config"),
    enabled: !!indicatorConfig
  });

  if (!indicatorConfig) {
    return notFound();
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Failed to load data</h2>
        <p className="text-muted-foreground mt-2">Could not fetch data for {indicatorConfig.name}</p>
      </div>
    );
  }

  // Format data for chart
  const chartData = data?.data?.map((d: any) => ({
    year: d.period,
    value: d.value
  })).sort((a: any, b: any) => a.year - b.year) || [];

  const validData = chartData.filter((d: any) => d.value !== null && d.value !== undefined);
  const latestValue = validData.length > 0 ? validData[validData.length - 1].value : null;
  const latestYear = validData.length > 0 ? validData[validData.length - 1].year : null;

  // Determine staleness: if latest data is > 2 years old
  const currentYear = new Date().getFullYear();
  const dataYear = latestYear ? parseInt(String(latestYear).slice(0, 4), 10) : 0;
  const isStale = dataYear > 0 && (currentYear - dataYear) > 2;

  const source = data?.unit ? "See below" : "World Bank"; // fallback
  const frequency = data?.native_frequency || "Annual";

  const handleExportCSV = () => {
    if (!validData || validData.length === 0) return;
    
    const headers = ["Year", "Value", "Unit"];
    const csvContent = [
      headers.join(","),
      ...validData.map((row: any) => `${row.year},${row.value},${indicatorConfig?.unit}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${indicatorConfig?.slug}_historical_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stale data banner */}
      {isStale && !isLoading && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-sm font-serif text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            The latest available data for this indicator is from <strong>{latestYear}</strong>. This may not reflect current conditions.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 font-serif transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
              {indicatorConfig.id}
            </div>
            <MethodologyDialog
              indicatorName={indicatorConfig.name}
              methodology={indicatorConfig.methodology}
              source={source}
              frequency={frequency}
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{indicatorConfig.name}</h1>
          <p className="text-muted-foreground mt-1">
            Historical data, trends, and AI-driven analysis.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCSV} disabled={!validData || validData.length === 0}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Historical Trend</CardTitle>
              <CardDescription>Value over time ({indicatorConfig.unit})</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/10 border border-border text-sm font-serif text-muted-foreground">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-foreground"></span>
                    </span>
                    <span className="animate-pulse">Waking up the data server... Please allow up to 50 seconds for the initial connection on our free hosting tier.</span>
                  </div>
                  <Skeleton className="w-full h-[350px] rounded-none" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-[350px] flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
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

        <div className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Latest Snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-foreground">
                    {latestValue ? formatIndicatorValue(latestValue, indicatorConfig.unit) : "N/A"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recorded in {latestYear || "N/A"}
                  </p>
                  {isStale && (
                    <StaleWarning period={String(latestYear || "unknown")} frequency={frequency} />
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Data Provenance Card */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Data Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <SourceBadge source={source} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">{frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latest Period</span>
                <span className="font-medium">{latestYear || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Points</span>
                <span className="font-medium">{validData.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/80">
                Data shows a persistent trend over the last decade. Analysis indicates high correlation with external macroeconomic factors. 
                <br/><br/>
                <em>(Full Gemini AI analysis will be integrated in Phase 2)</em>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

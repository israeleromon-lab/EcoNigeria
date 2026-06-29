"use client";

import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchIndicatorData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ForecastChart } from "@/components/ForecastChart";
import { Download, AlertCircle } from "lucide-react";
import { formatIndicatorValue } from "@/lib/utils";

export default function IndicatorPage() {
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
    year: d.date,
    value: d.value
  })).sort((a: any, b: any) => a.year - b.year) || [];

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const latestYear = chartData.length > 0 ? chartData[chartData.length - 1].year : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-2">
            {indicatorConfig.id}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{indicatorConfig.name}</h1>
          <p className="text-muted-foreground mt-1">
            Historical data, trends, and AI-driven analysis.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 md:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Historical Trend</CardTitle>
            <CardDescription>Value over time ({indicatorConfig.unit})</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[350px] rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="w-full h-[350px] flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
                No data available
              </div>
            ) : (
              <ForecastChart 
                indicatorCode={indicatorConfig.id}
                indicatorName={indicatorConfig.name}
                unit={indicatorConfig.unit}
                historicalData={chartData}
                color={indicatorConfig.color}
              />
            )}
          </CardContent>
        </Card>

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
                </>
              )}
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

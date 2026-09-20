"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSystemStatus, fetchDashboardData } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Server, 
  Layers, 
  Clock, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Radio
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DataStatusPage() {
  const { 
    data: statusData, 
    isLoading: isStatusLoading, 
    isError: isStatusError, 
    refetch: refetchStatus, 
    isFetching: isStatusFetching 
  } = useQuery({
    queryKey: ["system_status"],
    queryFn: fetchSystemStatus,
  });

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  const isLoading = isStatusLoading || isDashboardLoading;

  if (isStatusError) {
    return (
      <div className="space-y-6">
        <div className="border-b-4 border-foreground pb-6">
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">Data Infrastructure Status</h1>
          <p className="text-muted-foreground mt-2 font-serif">
            Unable to connect to the backend monitoring service.
          </p>
        </div>
        <div className="p-8 border border-destructive/30 bg-destructive/5 text-destructive">
          <p className="font-semibold">Backend connection failed.</p>
          <p className="text-sm mt-1 text-muted-foreground">
            Please ensure your backend data server on Render or local host is active.
          </p>
          <Button onClick={() => refetchStatus()} className="mt-4" variant="outline">
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const isOperational = statusData?.status === "operational";

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b-4 border-foreground pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOperational ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOperational ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            EconoNigeria 2.0 Ingestion Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Data Status & Pipelines</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2 font-serif">
            Real-time pipeline health, source synchronization latency, and observation provenance.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetchStatus()} 
          disabled={isStatusFetching}
          className="gap-2 rounded-none self-start md:self-end"
        >
          <RefreshCw className={`w-4 h-4 ${isStatusFetching ? 'animate-spin' : ''}`} />
          {isStatusFetching ? "Checking..." : "Refresh Status"}
        </Button>
      </div>

      {/* System Health Banner */}
      <div className={`p-6 border-2 ${isOperational ? 'border-emerald-600 bg-emerald-500/5' : 'border-amber-600 bg-amber-500/5'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isOperational ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider">
                {isOperational ? "All Ingestion Pipelines Operational" : "Pipeline Reporting Warnings"}
              </h2>
              <p className="text-sm font-serif text-muted-foreground mt-0.5">
                {isOperational 
                  ? "All active upstream data feeds are online, reporting observations, and maintaining historical integrity."
                  : "Some indicators have exceeded standard frequency publication windows or are awaiting updates."}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground sm:text-right">
            Last Checked: {statusData?.timestamp ? new Date(statusData.timestamp).toLocaleTimeString() : "Pending"}
          </div>
        </div>
      </div>

      {/* High-level Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-border">
        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs uppercase tracking-wider font-bold">Database Engine</span>
            <Database className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold font-serif">{statusData?.database_engine || "PostgreSQL"}</div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Mode: {statusData?.environment || "production"}
          </p>
        </div>

        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs uppercase tracking-wider font-bold">Total Observations</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold font-serif">{statusData?.total_observations ?? "..."}</div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Unique verified data points
          </p>
        </div>

        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs uppercase tracking-wider font-bold">Tracked Indicators</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold font-serif">{statusData?.total_indicators ?? 12}</div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Macroeconomic series
          </p>
        </div>

        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs uppercase tracking-wider font-bold">Data Freshness</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            {statusData?.freshness_percentage ? `${statusData.freshness_percentage}%` : "100%"}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {statusData?.stale_indicators_count ?? 0} delayed by source cycles
          </p>
        </div>
      </div>

      {/* Source Pipeline Feeds */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Source Pipelines</h2>
          <p className="text-muted-foreground font-serif text-sm">
            Health and ingestion latency across our primary upstream data providers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statusData?.sources?.map((source: any) => {
            const isLive = source.status === "operational";
            const isDev = source.status === "in_development";
            return (
              <Card key={source.key} className="bg-background border-border rounded-none shadow-none flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <SourceBadge source={source.name} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                      isLive 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : isDev
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {isLive ? "Operational" : isDev ? "In Development" : "Degraded"}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold mt-3 font-serif">{source.name}</CardTitle>
                  <CardDescription className="text-xs font-mono">{source.native_frequency}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm font-serif">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracked Series:</span>
                    <span className="font-semibold">{source.indicators_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Records:</span>
                    <span className="font-semibold">{source.total_observations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latest Observation:</span>
                    <span className="font-semibold">{source.latest_period || "—"}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span className="font-mono text-muted-foreground">
                      {source.last_checked ? new Date(source.last_checked).toLocaleDateString() : "Scheduled"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Indicator Freshness Matrix */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Indicator Freshness Matrix</h2>
          <p className="text-muted-foreground font-serif text-sm">
            Detailed status breakdown for each macroeconomic indicator currently tracked.
          </p>
        </div>

        <div className="border border-border bg-background overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Indicator</th>
                <th className="p-4">Code</th>
                <th className="p-4">Source</th>
                <th className="p-4">Frequency</th>
                <th className="p-4">Latest Period</th>
                <th className="p-4">Current Value</th>
                <th className="p-4">Freshness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dashboardData?.indicators?.map((ind: any) => {
                const isStale = ind.is_stale;
                return (
                  <tr key={ind.code} className="hover:bg-muted/10 transition-colors font-serif">
                    <td className="p-4 font-semibold text-foreground">
                      <Link href={`/${ind.code.toLowerCase()}`} className="hover:underline">
                        {ind.name}
                      </Link>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{ind.code}</td>
                    <td className="p-4">
                      <SourceBadge source={ind.source || "World Bank"} />
                    </td>
                    <td className="p-4 text-xs font-mono">{ind.native_frequency || "Annual"}</td>
                    <td className="p-4 font-semibold">{ind.current_period || "—"}</td>
                    <td className="p-4 font-mono">{ind.current_value != null ? `${ind.current_value} ${ind.unit || ''}` : "N/A"}</td>
                    <td className="p-4">
                      {isStale ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-sans font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" /> Source Lag
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Current
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Strategy SLA Callout */}
      <div className="p-6 border border-border bg-muted/10 space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider text-sm">
          <ShieldCheck className="w-4 h-4 text-primary" />
          EconoNigeria 2.0 Ingestion Policy & Zero-Fabrication SLA
        </div>
        <p className="text-sm font-serif text-muted-foreground leading-relaxed">
          EconoNigeria monitors high-frequency market data in near real-time, but enforces strict native-frequency boundaries for official national aggregates (such as GDP and Unemployment). We never fabricate or synthetically interpolate intermediate daily or minute-by-minute numbers between official quarterly or annual releases. If a source experiences reporting lag, our system surfaces this transparently to preserve academic and policymaking reproducibility.
        </p>
        <div className="flex gap-4 pt-2">
          <Link href="/methodology" className="text-xs font-bold uppercase tracking-wider underline flex items-center gap-1">
            Methodology Guide <ExternalLink className="w-3 h-3" />
          </Link>
          <a 
            href="https://github.com/israeleromon-lab/EcoNigeria/blob/main/docs/architecture.md" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs font-bold uppercase tracking-wider underline flex items-center gap-1"
          >
            Architecture Documentation <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchForecastData, fetchIndicatorData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { formatIndicatorValue } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { 
  BarChart3, 
  Cpu, 
  CheckCircle2, 
  Sliders, 
  Info, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Gauge
} from "lucide-react";
import Link from "next/link";

export default function ForecastLabPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("inflation");
  const [periods, setPeriods] = useState<number>(5);
  const [modelChoice, setModelChoice] = useState<string>("ensemble");
  const [shockPct, setShockPct] = useState<number>(0);

  const selectedIndicator = INDICATORS.find(i => i.slug === selectedSlug) || INDICATORS[2];

  // Fetch historical data
  const { 
    data: histResp, 
    isLoading: isHistLoading 
  } = useQuery({
    queryKey: ["indicator_hist", selectedIndicator.id],
    queryFn: () => fetchIndicatorData(selectedIndicator.id),
  });

  // Fetch forecast data with dynamic controls
  const { 
    data: forecastResp, 
    isLoading: isForecastLoading, 
    isError: isForecastError 
  } = useQuery({
    queryKey: ["forecast_lab", selectedIndicator.id, periods, modelChoice, shockPct],
    queryFn: () => fetchForecastData(selectedIndicator.id, periods, modelChoice, shockPct),
  });

  const isLoading = isHistLoading || isForecastLoading;

  // Format historical chart data
  const rawHist = histResp?.data?.map((d: any) => ({
    year: String(d.period),
    value: d.value != null ? Number(d.value) : null,
  })).sort((a: any, b: any) => Number(a.year) - Number(b.year)) || [];

  const validHist = rawHist.filter((d: any) => d.value !== null);

  // Combine historical and forecast projection points
  const chartData = [...validHist];

  if (forecastResp?.data?.forecast && validHist.length > 0) {
    const lastHist = validHist[validHist.length - 1];
    
    // Add transition point
    chartData[validHist.length - 1] = {
      year: lastHist.year,
      value: lastHist.value,
      forecast: lastHist.value,
      upper: lastHist.value,
      lower: lastHist.value,
      scenario: shockPct !== 0 ? lastHist.value : null,
    };

    forecastResp.data.forecast.forEach((f: any) => {
      chartData.push({
        year: String(f.period),
        value: null,
        forecast: f.selected_value,
        upper: f.prophet_upper,
        lower: f.prophet_lower,
        scenario: f.scenario_value,
      });
    });
  }

  const evaluation = forecastResp?.data?.evaluation;
  const modelCard = forecastResp?.data?.model_card;

  // Custom rich tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-card border-2 border-foreground p-3 shadow-xl text-xs font-serif rounded-none min-w-[200px]">
        <div className="font-mono font-bold text-sm border-b border-border pb-1 mb-2 uppercase tracking-wider text-foreground">
          Year: {label}
        </div>
        <div className="space-y-1.5 font-sans">
          {payload.map((entry: any, i: number) => {
            if (entry.value == null) return null;
            return (
              <div key={i} className="flex justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-bold font-serif" style={{ color: entry.color }}>
                  {formatIndicatorValue(entry.value, selectedIndicator.unit)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="border-b-4 border-foreground pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Cpu className="w-4 h-4 text-primary" />
            EconoNigeria 2.0 Predictive Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Forecast Lab</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2 font-serif max-w-3xl">
            Interactive multi-model forecasting laboratory. Explore projections across customizable horizons, evaluate out-of-sample backtesting metrics, and simulate macroeconomic shocks.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${selectedIndicator.slug}`}>
            <Button variant="outline" className="rounded-none text-xs gap-1.5 font-mono">
              View Indicator Page →
            </Button>
          </Link>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="border border-border bg-background p-6 space-y-6">
        {/* Indicator Selector Tabs */}
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-3">
            1. Select Macro Indicator
          </span>
          <div className="flex flex-wrap gap-2">
            {INDICATORS.map((ind) => (
              <button
                key={ind.id}
                onClick={() => {
                  setSelectedSlug(ind.slug);
                  setShockPct(0); // reset shock on switch
                }}
                className={`text-xs px-3 py-1.5 border transition-all font-serif ${
                  selectedSlug === ind.slug
                    ? "border-foreground bg-foreground text-background font-bold shadow-sm"
                    : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>

        {/* Horizon & Model Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-2">
              2. Forecast Horizon
            </span>
            <div className="flex gap-2">
              {[1, 3, 5, 8].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setPeriods(yr)}
                  className={`flex-1 py-1.5 px-3 border text-xs font-mono uppercase tracking-wider transition-all ${
                    periods === yr
                      ? "border-foreground bg-foreground text-background font-bold"
                      : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {yr} {yr === 1 ? "Year" : "Years"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-2">
              3. Statistical Model
            </span>
            <div className="flex gap-2">
              {[
                { key: "ensemble", label: "Ensemble (Recommended)" },
                { key: "prophet", label: "Meta Prophet" },
                { key: "arima", label: "ARIMA (1,1,1)" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModelChoice(m.key)}
                  className={`flex-1 py-1.5 px-2 border text-xs font-mono transition-all ${
                    modelChoice === m.key
                      ? "border-foreground bg-foreground text-background font-bold"
                      : "border-border/60 hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Shock Simulator */}
        <div className="pt-4 border-t border-border/50 bg-muted/10 p-4 border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase font-bold tracking-wider text-foreground">
                4. Scenario Shock Simulator
              </span>
              <span className="text-xs text-muted-foreground font-serif">
                (Test theoretical stress shocks)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary">
                {shockPct > 0 ? `+${shockPct}% Shock` : shockPct < 0 ? `${shockPct}% Shock` : "Baseline (0%)"}
              </span>
              {shockPct !== 0 && (
                <button
                  onClick={() => setShockPct(0)}
                  className="text-[10px] uppercase font-mono underline text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={shockPct}
              onChange={(e) => setShockPct(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>-30% Severe Contraction</span>
              <span>Baseline (0%)</span>
              <span>+30% Upside Shock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Forecast Chart */}
      <Card className="rounded-none border-2 border-foreground shadow-none bg-background">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold font-serif uppercase tracking-tight">
                {selectedIndicator.name} — Projection Trajectory
              </CardTitle>
              <CardDescription className="text-xs font-mono mt-1">
                Horizon: {periods} Years | Model: {modelChoice.toUpperCase()} | Unit: {selectedIndicator.unit}
              </CardDescription>
            </div>
            {shockPct !== 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" /> Simulated Scenario Active
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Skeleton className="w-full h-full rounded-none" />
            </div>
          ) : isForecastError ? (
            <div className="h-[400px] flex flex-col items-center justify-center border border-dashed text-muted-foreground text-sm font-serif p-6 text-center">
              <AlertCircle className="w-8 h-8 text-destructive mb-2" />
              <span>Forecast could not be generated for this series. Minimum 5 historical observations required.</span>
            </div>
          ) : (
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 24, right: 20, left: 4, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.25} />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    minTickGap={35}
                    tick={{ fill: '#888888', fontSize: 11, fontFamily: 'monospace' }}
                    dy={8}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(v) => {
                      const num = Number(v);
                      if (isNaN(num)) return String(v);
                      if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
                      if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
                      if (Math.abs(num) >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
                      return Number.isInteger(num) ? String(num) : num.toFixed(1);
                    }}
                    width={65}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    wrapperStyle={{ 
                      fontSize: '11px', 
                      fontFamily: 'monospace',
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      paddingBottom: '10px'
                    }} 
                  />

                  {/* Historical Area */}
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={selectedIndicator.color} 
                    strokeWidth={3}
                    fillOpacity={0.2} 
                    fill={selectedIndicator.color} 
                    name="Historical Observation"
                  />

                  {/* Forecast Line */}
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#eab308" 
                    strokeWidth={3} 
                    strokeDasharray="5 5" 
                    dot={{ r: 4, fill: '#eab308' }}
                    name="Projected Forecast"
                  />

                  {/* Confidence Interval Bands */}
                  <Line 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="#eab308" 
                    strokeWidth={1} 
                    strokeDasharray="2 2" 
                    dot={false}
                    opacity={0.45}
                    name="80% Confidence Band"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lower" 
                    stroke="#eab308" 
                    strokeWidth={1} 
                    strokeDasharray="2 2" 
                    dot={false}
                    opacity={0.45}
                    legendType="none"
                    name="80% Lower Bound"
                  />

                  {/* Scenario Line */}
                  {shockPct !== 0 && (
                    <Line 
                      type="monotone" 
                      dataKey="scenario" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#8b5cf6' }}
                      name={`Scenario (${shockPct > 0 ? '+' : ''}${shockPct}%)`}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Evaluation & Model Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Out-of-Sample Backtesting Card */}
        <Card className="rounded-none border border-border bg-background flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Model Evaluation
              </span>
              <Gauge className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold uppercase mt-1">Out-of-Sample Backtesting</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 font-serif text-sm">
            {evaluation?.backtested ? (
              <>
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Validation Accuracy:</span>
                  <span className="font-sans font-bold text-emerald-600 dark:text-emerald-400">
                    {evaluation.accuracy_grade}
                  </span>
                </div>
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Mean Abs % Error (MAPE):</span>
                  <span className="font-mono font-bold text-foreground">{evaluation.mape_pct}%</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">Root Mean Sq Error (RMSE):</span>
                  <span className="font-mono font-bold text-foreground">{evaluation.rmse}</span>
                </div>
                <div className="flex justify-between items-baseline text-xs text-muted-foreground">
                  <span>Holdout Test Window:</span>
                  <span className="font-mono">{evaluation.holdout_periods} observations</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Backtesting evaluation requires at least 8 observations to partition historical holdouts.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Model Card Specifications */}
        <Card className="rounded-none border border-border bg-background md:col-span-2 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Reproducibility & Methodology
              </span>
              <Info className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold uppercase mt-1">Model Card & Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs font-serif leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground font-sans uppercase tracking-wider text-[11px] block mb-0.5">Ensemble Methodology:</strong>
              EconoNigeria uses a hybrid ensemble blending <strong>Meta Prophet</strong> (bayesian additive changepoint decomposition) with <strong>Box-Jenkins ARIMA(1,1,1)</strong> (autoregressive integrated moving average). Blending these distinct mathematical frameworks reduces single-model bias when analyzing structural emerging-market transitions.
            </p>
            <p>
              <strong className="text-foreground font-sans uppercase tracking-wider text-[11px] block mb-0.5">Assumptions:</strong>
              {modelCard?.assumptions || "Assumes persistence of current macro monetary regime without catastrophic external debt default."}
            </p>
            <p>
              <strong className="text-foreground font-sans uppercase tracking-wider text-[11px] block mb-0.5">Caveats & Limitations:</strong>
              {modelCard?.caveats || "Historical volatility in Nigerian foreign exchange markets increases forecast interval fan width."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

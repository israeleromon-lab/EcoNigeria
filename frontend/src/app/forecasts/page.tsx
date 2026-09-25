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

import { NumberTicker } from "@/components/magicui/NumberTicker";

const SCENARIO_PRESETS = [
  {
    label: "Oil Shock: Brent @ $50",
    slug: "brent-oil",
    shockPct: -28,
  },
  {
    label: "Naira FX Float Stress (-20%)",
    slug: null,
    shockPct: -20,
  },
  {
    label: "Baseline Regime (0%)",
    slug: null,
    shockPct: 0,
  },
  {
    label: "Reform & Export Expansion (+15%)",
    slug: null,
    shockPct: 15,
  },
];

export default function ForecastLabPage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("inflation");
  const [periods, setPeriods] = useState<number>(5);
  const [modelChoice, setModelChoice] = useState<string>("ensemble");
  const [shockPct, setShockPct] = useState<number>(0);
  const [committedShockPct, setCommittedShockPct] = useState<number>(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const selectedIndicator = INDICATORS.find(i => i.slug === selectedSlug) || INDICATORS[2];

  // Fetch historical data
  const { 
    data: histResp, 
    isLoading: isHistLoading 
  } = useQuery({
    queryKey: ["indicator_hist", selectedIndicator.id],
    queryFn: () => fetchIndicatorData(selectedIndicator.id),
  });

  // Fetch forecast data with committed controls
  const { 
    data: forecastResp, 
    isLoading: isForecastLoading, 
    isError: isForecastError 
  } = useQuery({
    queryKey: ["forecast_lab", selectedIndicator.id, periods, modelChoice, committedShockPct],
    queryFn: () => fetchForecastData(selectedIndicator.id, periods, modelChoice, committedShockPct),
  });

  const isLoading = isHistLoading || isForecastLoading;

  // Format historical chart data
  const rawHist = histResp?.data?.map((d: any) => ({
    year: String(d.period),
    value: d.value != null ? Number(d.value) : null,
  })).sort((a: any, b: any) => Number(a.year) - Number(b.year)) || [];

  const validHist = rawHist.filter((d: any) => d.value !== null);

  // Combine historical and forecast projection points (with instantaneous client-side shock preview while dragging)
  const chartData = [...validHist];

  const forecastSeries = forecastResp?.data?.forecast || [];
  if (forecastSeries.length > 0 && validHist.length > 0) {
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

    forecastSeries.forEach((f: any) => {
      const baseForecastVal = Number(f.selected_value ?? 0);
      const liveScenarioVal =
        shockPct === 0
          ? null
          : Number((baseForecastVal * (1 + shockPct / 100)).toFixed(4));

      chartData.push({
        year: String(f.period),
        value: null,
        forecast: f.selected_value,
        upper: f.prophet_upper,
        lower: f.prophet_lower,
        scenario: liveScenarioVal ?? f.scenario_value,
      });
    });
  }

  const terminalPoint =
    forecastSeries.length > 0 ? forecastSeries[forecastSeries.length - 1] : null;
  const baselineTerminalValue =
    terminalPoint?.selected_value != null
      ? Number(terminalPoint.selected_value)
      : validHist.length > 0
      ? Number(validHist[validHist.length - 1].value)
      : 0;
  const shockedTerminalValue = Number(
    (baselineTerminalValue * (1 + shockPct / 100)).toFixed(2)
  );
  const terminalDeltaValue = Number(
    (shockedTerminalValue - baselineTerminalValue).toFixed(2)
  );

  const evaluation = forecastResp?.data?.evaluation;
  const modelCard = forecastResp?.data?.model_card;

  // Custom rich tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-card dark:bg-[#111622] border border-border dark:border-white/[0.15] p-3 shadow-xl text-xs font-mono rounded-none min-w-[200px]">
        <div className="font-mono font-bold text-xs border-b border-border dark:border-white/[0.08] pb-1 mb-2 uppercase tracking-wider text-foreground">
          Period: {label}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, i: number) => {
            if (entry.value == null) return null;
            return (
              <div key={i} className="flex justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-bold font-mono tabular-nums" style={{ color: entry.color }}>
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
      <div className="border-b border-border dark:border-white/[0.12] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-emerald-500">
            <Cpu className="w-4 h-4 text-emerald-500" />
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
      <div className="border border-border dark:border-white/[0.08] bg-card dark:bg-[#0B0F17] p-6 space-y-6">
        {/* Indicator Selector Tabs */}
        <div>
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground block mb-3">
            1. Select Macro Indicator
          </span>
          <div className="flex flex-wrap gap-2">
            {INDICATORS.map((ind) => (
              <button
                key={ind.id}
                onClick={() => {
                  setSelectedSlug(ind.slug);
                  setIsDraggingSlider(false);
                  setShockPct(0);
                  setCommittedShockPct(0);
                }}
                className={`text-xs px-3 py-1.5 border transition-all font-mono uppercase tracking-wider ${
                  selectedSlug === ind.slug
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold"
                    : "border-border dark:border-white/[0.08] hover:bg-muted/30 text-muted-foreground"
                }`}
              >
                {ind.name}
              </button>
            ))}
          </div>
        </div>

        {/* Horizon & Model Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50 dark:border-white/[0.08]">
          <div>
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground block mb-2">
              2. Forecast Horizon
            </span>
            <div className="flex gap-2">
              {[1, 3, 5, 8].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setPeriods(yr)}
                  className={`flex-1 py-1.5 px-3 border text-xs font-mono uppercase tracking-wider transition-all ${
                    periods === yr
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold"
                      : "border-border dark:border-white/[0.08] hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {yr} {yr === 1 ? "Year" : "Years"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-mono uppercase font-bold tracking-wider text-muted-foreground block mb-2">
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
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold"
                      : "border-border dark:border-white/[0.08] hover:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Shock Simulator with Drag Bypass Rule & Automated Scenario Presets */}
        <div className="pt-4 border-t border-border/50 dark:border-white/[0.08] bg-background dark:bg-[#111622] p-4 border dark:border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-foreground">
                4. Scenario Shock Simulator
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {isDraggingSlider
                  ? "[DRAG BYPASS ACTIVE · RAW FRAME READOUT]"
                  : "[SPRING LOCKED · STIFFNESS 260 / DAMPING 32]"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
                {shockPct > 0 ? `+${shockPct}% Shock` : shockPct < 0 ? `${shockPct}% Shock` : "Baseline (0%)"}
              </span>
              {shockPct !== 0 && (
                <button
                  onClick={() => {
                    setIsDraggingSlider(false);
                    setShockPct(0);
                    setCommittedShockPct(0);
                  }}
                  className="text-[10px] uppercase font-mono underline text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Automated Scenario Presets (Triggers overdamped spring roll) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
              Presets:
            </span>
            {SCENARIO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  // Ensure spring is active (not bypassed) for automated preset roll
                  setIsDraggingSlider(false);
                  if (preset.slug && preset.slug !== selectedSlug) {
                    setSelectedSlug(preset.slug);
                  }
                  setShockPct(preset.shockPct);
                  setCommittedShockPct(preset.shockPct);
                }}
                className={`px-2.5 py-1 text-[11px] font-mono border transition-colors ${
                  shockPct === preset.shockPct &&
                  (!preset.slug || preset.slug === selectedSlug)
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold"
                    : "border-border dark:border-white/[0.1] bg-card dark:bg-[#0B0F17] text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="-30"
              max="30"
              step="1"
              value={shockPct}
              onPointerDown={() => setIsDraggingSlider(true)}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
              onChange={(e) => setShockPct(Number(e.target.value))}
              onPointerUp={() => {
                setIsDraggingSlider(false);
                setCommittedShockPct(shockPct);
              }}
              onMouseUp={() => {
                setIsDraggingSlider(false);
                setCommittedShockPct(shockPct);
              }}
              onTouchEnd={() => {
                setIsDraggingSlider(false);
                setCommittedShockPct(shockPct);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>-30% Severe Contraction</span>
              <span>Baseline (0%)</span>
              <span>+30% Upside Shock</span>
            </div>
          </div>

          {/* Live Tabular Terminal Readout Strip with Drag Bypass */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50 dark:border-white/[0.08]">
            <div className="p-3 bg-card dark:bg-[#0B0F17] border border-border dark:border-white/[0.08]">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Baseline Terminal ({terminalPoint?.period || `+${periods}Y`})
              </span>
              <NumberTicker
                value={baselineTerminalValue}
                bypassSpring={isDraggingSlider}
                formatter={(val) =>
                  formatIndicatorValue(val, selectedIndicator.unit)
                }
                className="text-lg font-bold font-mono tabular-nums text-foreground mt-0.5"
              />
            </div>

            <div className="p-3 bg-card dark:bg-[#0B0F17] border border-border dark:border-white/[0.08]">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Scenario Projected Value
              </span>
              <NumberTicker
                value={shockedTerminalValue}
                bypassSpring={isDraggingSlider}
                formatter={(val) =>
                  formatIndicatorValue(val, selectedIndicator.unit)
                }
                className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5"
              />
            </div>

            <div className="p-3 bg-card dark:bg-[#0B0F17] border border-border dark:border-white/[0.08]">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Net Scenario Spread
              </span>
              <NumberTicker
                value={terminalDeltaValue}
                bypassSpring={isDraggingSlider}
                formatter={(val) => {
                  const sign = val > 0 ? "+" : "";
                  return `${sign}${formatIndicatorValue(val, selectedIndicator.unit)}`;
                }}
                className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                  terminalDeltaValue > 0
                    ? "text-emerald-400"
                    : terminalDeltaValue < 0
                    ? "text-rose-400"
                    : "text-muted-foreground"
                }`}
              />
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

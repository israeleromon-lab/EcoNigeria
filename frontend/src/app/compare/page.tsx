"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPanAfricanBenchmarks, fetchBilateralComparison } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Globe2, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Download, 
  Info,
  ChevronRight,
  BarChart3,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COUNTRY_OPTIONS = [
  { code: "NGA", slug: "nigeria", name: "Nigeria", flag: "🇳🇬", region: "West Africa" },
  { code: "GHA", slug: "ghana", name: "Ghana", flag: "🇬🇭", region: "West Africa" },
  { code: "KEN", slug: "kenya", name: "Kenya", flag: "🇰🇪", region: "East Africa" },
  { code: "ZAF", slug: "south-africa", name: "South Africa", flag: "🇿🇦", region: "Southern Africa" },
  { code: "EGY", slug: "egypt", name: "Egypt", flag: "🇪🇬", region: "North Africa" },
  { code: "RWA", slug: "rwanda", name: "Rwanda", flag: "🇷🇼", region: "East Africa" },
  { code: "CIV", slug: "cote-divoire", name: "Côte d'Ivoire", flag: "🇨🇮", region: "West Africa" },
];

const PRESET_PAIRS = [
  { a: "nigeria", b: "ghana", label: "Nigeria vs Ghana (West Africa)" },
  { a: "nigeria", b: "kenya", label: "Nigeria vs Kenya (East vs West)" },
  { a: "nigeria", b: "south-africa", label: "Nigeria vs South Africa (Powerhouses)" },
  { a: "nigeria", b: "egypt", label: "Nigeria vs Egypt (Scale & Debt)" },
  { a: "nigeria", b: "rwanda", label: "Nigeria vs Rwanda (Growth Pace)" },
];

export default function ComparePage() {
  const [countryA, setCountryA] = useState("nigeria");
  const [countryB, setCountryB] = useState("ghana");
  const [activeMetric, setActiveMetric] = useState<"inflation" | "gdp_growth" | "debt_to_gdp">("inflation");

  // Fetch all African benchmarks
  const { data: benchmarksData, isLoading: benchmarksLoading } = useQuery({
    queryKey: ["pan_african_benchmarks"],
    queryFn: fetchPanAfricanBenchmarks,
  });

  // Fetch bilateral comparison
  const { data: bilateralData, isLoading: bilateralLoading } = useQuery({
    queryKey: ["bilateral_compare", countryA, countryB],
    queryFn: () => fetchBilateralComparison(countryA, countryB),
    enabled: Boolean(countryA && countryB && countryA !== countryB),
  });

  const benchmarks = benchmarksData?.benchmarks || [];
  const cA = bilateralData?.country_a;
  const cB = bilateralData?.country_b;
  const diffs = bilateralData?.differentials || {};
  const chartData = bilateralData?.aligned_time_series?.[activeMetric] || [];

  const handleSwap = () => {
    const temp = countryA;
    setCountryA(countryB);
    setCountryB(temp);
  };

  const handleExportCSV = () => {
    if (!benchmarks.length) return;
    const headers = ["Country", "Code", "Region", "GDP Growth (%)", "Inflation (%)", "Debt (% GDP)", "GDP Per Capita (USD)", "Population (M)"];
    const rows = benchmarks.map((b: any) => [
      b.name,
      b.code,
      b.region,
      b.gdp_growth_rate,
      b.inflation_rate,
      b.debt_to_gdp,
      b.gdp_per_capita,
      b.population_millions,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r: any[]) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `EconoNigeria-PanAfrican-Benchmarks.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b-4 border-foreground pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Phase F Pan-African Intelligence Layer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">
              Cross-Country Comparison Tool
            </h1>
            <p className="text-lg text-muted-foreground mt-3 font-serif italic max-w-3xl">
              Benchmarking Nigeria against African peer economies. Analyze growth differentials, consumer price divergence, and sovereign debt leverage across the continent.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-wider">
              7 Economies Live
            </span>
          </div>
        </div>
      </div>

      {/* Bilateral Comparison Selector Bar */}
      <div className="border-4 border-foreground bg-background p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-foreground pb-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-foreground" />
              Bilateral Economic Diagnostic
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Select any two peer economies to compute divergence spreads and comparative time series.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mr-1">
              Presets:
            </span>
            {PRESET_PAIRS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setCountryA(preset.a);
                  setCountryB(preset.b);
                }}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-colors ${
                  countryA === preset.a && countryB === preset.b
                    ? "bg-foreground text-background border-foreground font-bold"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {preset.label.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Selectors & Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
          {/* Country A */}
          <div className="border-2 border-foreground p-4 bg-muted/10">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground block mb-2">
              Primary Economy (Country A)
            </label>
            <select
              value={countryA}
              onChange={(e) => setCountryA(e.target.value)}
              className="w-full bg-background border border-border p-2.5 font-bold uppercase tracking-wider text-sm focus:outline-none focus:border-foreground"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.slug} value={c.slug} disabled={c.slug === countryB}>
                  {c.flag} {c.name} ({c.code} — {c.region})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 border-2 border-foreground bg-background hover:bg-muted transition-colors rounded-none"
              title="Swap Countries"
            >
              <ArrowRightLeft className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Country B */}
          <div className="border-2 border-foreground p-4 bg-muted/10">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground block mb-2">
              Benchmark Economy (Country B)
            </label>
            <select
              value={countryB}
              onChange={(e) => setCountryB(e.target.value)}
              className="w-full bg-background border border-border p-2.5 font-bold uppercase tracking-wider text-sm focus:outline-none focus:border-foreground"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.slug} value={c.slug} disabled={c.slug === countryA}>
                  {c.flag} {c.name} ({c.code} — {c.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparative Divergence Cards */}
        {bilateralLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : cA && cB ? (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-border">
              {/* Inflation Differential */}
              <div className="border-r border-b border-border p-5 bg-background">
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Inflation Spread
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {diffs.inflation_spread > 0 ? `+${diffs.inflation_spread}%` : `${diffs.inflation_spread}%`}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">differential</span>
                </div>
                <div className="mt-3 text-xs font-mono text-muted-foreground flex justify-between border-t border-border/50 pt-2">
                  <span>{cA.flag} {cA.metrics.inflation}%</span>
                  <span>vs</span>
                  <span>{cB.flag} {cB.metrics.inflation}%</span>
                </div>
              </div>

              {/* GDP Growth Differential */}
              <div className="border-r border-b border-border p-5 bg-background">
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  GDP Growth Spread
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {diffs.gdp_growth_spread > 0 ? `+${diffs.gdp_growth_spread}%` : `${diffs.gdp_growth_spread}%`}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">differential</span>
                </div>
                <div className="mt-3 text-xs font-mono text-muted-foreground flex justify-between border-t border-border/50 pt-2">
                  <span>{cA.flag} {cA.metrics.gdp_growth}%</span>
                  <span>vs</span>
                  <span>{cB.flag} {cB.metrics.gdp_growth}%</span>
                </div>
              </div>

              {/* Debt-to-GDP Spread */}
              <div className="border-r border-b border-border p-5 bg-background">
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Debt-to-GDP Spread
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {diffs.debt_spread > 0 ? `+${diffs.debt_spread}%` : `${diffs.debt_spread}%`}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">of GDP delta</span>
                </div>
                <div className="mt-3 text-xs font-mono text-muted-foreground flex justify-between border-t border-border/50 pt-2">
                  <span>{cA.flag} {cA.metrics.debt_to_gdp}%</span>
                  <span>vs</span>
                  <span>{cB.flag} {cB.metrics.debt_to_gdp}%</span>
                </div>
              </div>

              {/* GDP Per Capita Gap */}
              <div className="border-r border-b border-border p-5 bg-background">
                <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Income Per Capita Gap
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {diffs.gdp_per_capita_spread > 0 ? `+$${diffs.gdp_per_capita_spread}` : `-$${Math.abs(diffs.gdp_per_capita_spread)}`}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">USD delta</span>
                </div>
                <div className="mt-3 text-xs font-mono text-muted-foreground flex justify-between border-t border-border/50 pt-2">
                  <span>{cA.flag} ${cA.metrics.gdp_per_capita}</span>
                  <span>vs</span>
                  <span>{cB.flag} ${cB.metrics.gdp_per_capita}</span>
                </div>
              </div>
            </div>

            {/* Empirical Synthesis Insights */}
            {bilateralData.analytical_insights && bilateralData.analytical_insights.length > 0 && (
              <div className="p-5 border-l-4 border-foreground bg-muted/10 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-foreground">
                  Empirical Divergence Analysis
                </h4>
                <ul className="space-y-2">
                  {bilateralData.analytical_insights.map((insight: string, idx: number) => (
                    <li key={idx} className="text-xs font-serif leading-relaxed text-muted-foreground pl-3 border-l border-border">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Aligned Historical Trajectory Chart */}
            <div className="border border-border p-6 bg-background space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                    10-Year Comparative Trajectory (2018–2024)
                  </h3>
                  <div className="text-xs font-serif text-muted-foreground">
                    Synchronized annual series for {cA.name} ({cA.flag}) and {cB.name} ({cB.flag})
                  </div>
                </div>

                {/* Metric Switcher */}
                <div className="flex items-center gap-1">
                  {(["inflation", "gdp_growth", "debt_to_gdp"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setActiveMetric(m)}
                      className={`px-3 py-1 text-xs font-mono uppercase tracking-wider border transition-colors ${
                        activeMetric === m
                          ? "bg-foreground text-background border-foreground font-bold"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {m === "inflation" ? "Inflation" : m === "gdp_growth" ? "GDP Growth" : "Debt / GDP"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recharts Line Chart */}
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 16, right: 24, left: 4, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" strokeOpacity={0.25} />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false} 
                      tickLine={false} 
                      minTickGap={25}
                      tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
                      dy={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      width={55}
                      tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      content={({ active, payload, label }: any) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-card border-2 border-foreground p-3 shadow-xl text-xs font-mono min-w-[180px]">
                            <div className="font-bold text-foreground border-b border-border pb-1 mb-2 uppercase tracking-wider">
                              Year: {label}
                            </div>
                            <div className="space-y-1.5">
                              {payload.map((entry: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                  <span className="text-muted-foreground">{entry.name}:</span>
                                  <span className="font-bold" style={{ color: entry.color }}>
                                    {entry.value != null ? `${entry.value}%` : "N/A"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ 
                        fontFamily: "monospace", 
                        fontSize: "12px", 
                        paddingBottom: "10px" 
                      }} 
                    />
                    <Line
                      type="monotone"
                      dataKey={cA.code}
                      name={`${cA.flag} ${cA.name}`}
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#3b82f6" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey={cB.code}
                      name={`${cB.flag} ${cB.name}`}
                      stroke="#10b981"
                      strokeWidth={3}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: "#10b981" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Pan-African Benchmark Matrix Table */}
      <div className="space-y-6">
        <div className="border-b-2 border-foreground pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-foreground" />
              Pan-African Macroeconomic Benchmark Matrix
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Harmonized metrics across 7 African economies (World Bank / IMF WEO Standardized).
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider border border-border hover:bg-muted flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Benchmark CSV
          </button>
        </div>

        {benchmarksLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-foreground bg-background">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Economy</th>
                  <th className="p-3.5">Region</th>
                  <th className="p-3.5 text-right">GDP Growth</th>
                  <th className="p-3.5 text-right">CPI Inflation</th>
                  <th className="p-3.5 text-right">Debt / GDP</th>
                  <th className="p-3.5 text-right">GDP Per Capita</th>
                  <th className="p-3.5 text-right">Population</th>
                  <th className="p-3.5 text-right">Unemployment</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {benchmarks.map((row: any) => {
                  const isNigeria = row.code === "NGA";
                  return (
                    <tr 
                      key={row.code}
                      className={`hover:bg-muted/30 transition-colors ${isNigeria ? "bg-muted/15 font-semibold" : ""}`}
                    >
                      <td className="p-3.5 flex items-center gap-2">
                        <span className="text-base">{row.flag}</span>
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            {row.name}
                            {isNigeria && (
                              <span className="text-[9px] font-mono px-1 py-0.2 bg-foreground text-background">
                                HOME
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{row.currency}</div>
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground">{row.region}</td>
                      <td className={`p-3.5 text-right font-bold ${row.gdp_growth_rate >= 5.0 ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
                        {row.gdp_growth_rate?.toFixed(2)}%
                      </td>
                      <td className={`p-3.5 text-right font-bold ${row.inflation_rate >= 20.0 ? "text-destructive" : ""}`}>
                        {row.inflation_rate?.toFixed(1)}%
                      </td>
                      <td className={`p-3.5 text-right ${row.debt_to_gdp >= 75.0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                        {row.debt_to_gdp?.toFixed(1)}%
                      </td>
                      <td className="p-3.5 text-right font-bold">
                        ${row.gdp_per_capita?.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right text-muted-foreground">
                        {row.population_millions?.toFixed(1)}M
                      </td>
                      <td className="p-3.5 text-right text-muted-foreground">
                        {row.unemployment_rate?.toFixed(1)}%
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            setCountryA("nigeria");
                            setCountryB(row.slug);
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                          className="px-2 py-1 text-[10px] uppercase font-bold border border-border hover:bg-foreground hover:text-background transition-colors"
                        >
                          Compare
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

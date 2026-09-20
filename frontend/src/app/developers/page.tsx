"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  KeyRound, 
  Zap, 
  ShieldCheck, 
  BookOpen, 
  Globe, 
  FileSpreadsheet,
  Cpu,
  Milestone
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";

type LangTab = "curl" | "python" | "javascript";

export default function DevelopersPortalPage() {
  const [activeLang, setActiveLang] = useState<LangTab>("curl");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const baseUrl = API_BASE_URL.replace(/\/$/, "");

  const codeSnippets: Record<LangTab, string> = {
    curl: `# 1. Fetch live Nigeria Economic Pulse
curl -X GET "${baseUrl}/v1/pulse"

# 2. Fetch Inflation history as CSV
curl -X GET "${baseUrl}/v1/indicators/inflation/history?format=csv" -o inflation.csv

# 3. Fetch 3-year Prophet/ARIMA forecasts with simulated shock
curl -X GET "${baseUrl}/v1/forecasts/gdp-growth?periods=3&model=ensemble&shock_pct=10"`,

    python: `import requests

# 1. Fetch current Economic Pulse score
pulse_res = requests.get("${baseUrl}/v1/pulse")
pulse = pulse_res.json()
print(f"Economic Pulse: {pulse['composite_score']}/100 ({pulse['rating']})")

# 2. Fetch Inflation data using slug
inf_res = requests.get("${baseUrl}/v1/indicators/inflation")
inf = inf_res.json()
print(f"Latest Inflation: {inf['statistics']['latest_value']}% in {inf['statistics']['latest_period']}")

# 3. Stream historical dataset as CSV
csv_res = requests.get("${baseUrl}/v1/indicators/inflation/history?format=csv")
with open("nigeria_inflation.csv", "w", encoding="utf-8") as f:
    f.write(csv_res.text)
print("Saved historical CSV successfully!")`,

    javascript: `// 1. Fetch current Economic Pulse
const pulseRes = await fetch("${baseUrl}/v1/pulse");
const pulse = await pulseRes.json();
console.log(\`Nigeria Pulse: \${pulse.composite_score}/100 - \${pulse.rating}\`);

// 2. Fetch Multi-Model Forecasts
const fcstRes = await fetch("${baseUrl}/v1/forecasts/inflation?periods=3&model=ensemble");
const fcst = await fcstRes.json();
console.log("3-Year Forecast:", fcst.forecast);

// 3. Fetch Curated Policy & Shock Timeline
const eventsRes = await fetch("${baseUrl}/v1/events?category=Structural Reform");
const events = await eventsRes.json();
console.log(\`Found \${events.count} structural reform events\`);`
  };

  const endpoints = [
    {
      id: "ep-pulse",
      method: "GET",
      path: "/v1/pulse",
      title: "Real-Time Economic Pulse",
      description: "Returns the 0-100 composite macroeconomic health score, rating band, qualitative summary, and top macro drivers.",
      params: "None",
      sampleUrl: `${baseUrl}/v1/pulse`,
      tags: ["Intelligence", "Phase C"]
    },
    {
      id: "ep-indicators",
      method: "GET",
      path: "/v1/indicators",
      title: "Macroeconomic Series Catalog",
      description: "Returns the complete catalog of all 12 indicators with human slugs, institutional codes, units, sources, and latest observations.",
      params: "None",
      sampleUrl: `${baseUrl}/v1/indicators`,
      tags: ["Catalog", "Data"]
    },
    {
      id: "ep-indicator-detail",
      method: "GET",
      path: "/v1/indicators/{slug_or_code}",
      title: "Single Indicator Detail & Statistics",
      description: "Resolves an indicator by either human slug (e.g., 'inflation') or code ('FP.CPI.TOTL.ZG') and returns summary statistics (mean, min, max).",
      params: "slug_or_code: string (path)",
      sampleUrl: `${baseUrl}/v1/indicators/inflation`,
      tags: ["Data", "Stats"]
    },
    {
      id: "ep-history",
      method: "GET",
      path: "/v1/indicators/{slug_or_code}/history",
      title: "Historical Time-Series (JSON / CSV)",
      description: "Returns full chronological observations with observation timestamps. Supports streaming directly as a CSV download file.",
      params: "start_year: int, end_year: int, format: 'json' | 'csv'",
      sampleUrl: `${baseUrl}/v1/indicators/inflation/history?format=json`,
      tags: ["Time-Series", "Export"]
    },
    {
      id: "ep-forecasts",
      method: "GET",
      path: "/v1/forecasts/{slug_or_code}",
      title: "Multi-Model Forecasts & Backtest Metrics",
      description: "Generates forward projections with 80% Bayesian credible intervals, empirical backtesting MAPE/RMSE, and scenario shock simulation.",
      params: "periods: 1-10 (default 5), model: 'ensemble' | 'prophet' | 'arima', shock_pct: -50 to +50",
      sampleUrl: `${baseUrl}/v1/forecasts/inflation?periods=3&model=ensemble`,
      tags: ["Forecasting", "Phase D"]
    },
    {
      id: "ep-events",
      method: "GET",
      path: "/v1/events",
      title: "Macroeconomic Policy & Shock Timeline",
      description: "Returns curated historical Nigerian economic events (e.g. 2023 Subsidy & FX Float, 2024 MPR Hikes, 2016 Recession) with indicator mappings.",
      params: "category: string, indicator: string",
      sampleUrl: `${baseUrl}/v1/events`,
      tags: ["Historical Context", "Policy"]
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="border-b-4 border-foreground pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Code2 className="w-4 h-4 text-primary" />
            EconoNigeria 2.0 Open Data Infrastructure
          </div>
          <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight">Developer Portal & API</h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2 font-serif max-w-3xl">
            Free, un-paywalled REST API providing clean Nigerian macroeconomic datasets, real-time intelligence scores, multi-model forecasts, and policy timelines.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`${baseUrl}/docs`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-none text-xs gap-1.5 font-mono">
              FastAPI Swagger Docs <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Access Guarantees Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-l border-t border-border">
        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider text-xs mb-1">
            <KeyRound className="w-4 h-4 text-emerald-500" />
            Zero Authentication
          </div>
          <p className="text-xs text-muted-foreground font-serif">
            No API keys, developer tokens, or billing tiers. Public endpoints are freely accessible for all users.
          </p>
        </div>

        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider text-xs mb-1">
            <Globe className="w-4 h-4 text-blue-500" />
            Slug & Code Resolution
          </div>
          <p className="text-xs text-muted-foreground font-serif">
            Use clean human-readable slugs (<code className="font-mono">/inflation</code>) or institutional series codes interchangeably.
          </p>
        </div>

        <div className="p-6 bg-background border-r border-b border-border">
          <div className="flex items-center gap-2 text-foreground font-bold uppercase tracking-wider text-xs mb-1">
            <FileSpreadsheet className="w-4 h-4 text-amber-500" />
            Direct CSV Streaming
          </div>
          <p className="text-xs text-muted-foreground font-serif">
            Append <code className="font-mono">?format=csv</code> to time-series endpoints to export directly into Excel, Pandas, or R.
          </p>
        </div>
      </div>

      {/* Interactive Code Sandbox */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Quickstart Examples</h2>
            <p className="text-xs text-muted-foreground font-serif">
              Copy and paste working client code to integrate EconoNigeria into your application.
            </p>
          </div>

          <div className="flex gap-1 border border-border bg-background p-0.5 self-start">
            {(["curl", "python", "javascript"] as LangTab[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all ${
                  activeLang === lang
                    ? "bg-foreground text-background font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="border-2 border-foreground bg-card rounded-none relative">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Terminal className="w-3.5 h-3.5" />
              <span>Base URL: <strong className="text-foreground">{baseUrl}/v1</strong></span>
            </div>
            <button
              onClick={() => copyToClipboard(codeSnippets[activeLang], "quickstart")}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedId === "quickstart" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto whitespace-pre leading-relaxed bg-background/50">
            {codeSnippets[activeLang]}
          </pre>
        </div>
      </div>

      {/* Endpoints Directory */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Endpoint Reference</h2>
          <p className="text-xs text-muted-foreground font-serif">
            Comprehensive directory of available v1 endpoints with parameter specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {endpoints.map((ep) => (
            <Card key={ep.id} className="rounded-none border border-border bg-background shadow-none hover:border-foreground transition-all">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {ep.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {ep.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] uppercase font-mono px-2 py-0.5 bg-muted/30 border border-border text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-base font-bold font-serif mt-2">{ep.title}</CardTitle>
                <CardDescription className="text-xs font-serif">{ep.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="text-muted-foreground">
                  Parameters: <span className="text-foreground">{ep.params}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(`curl "${ep.sampleUrl}"`, ep.id)}
                    className="hover:underline flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    {copiedId === ep.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedId === ep.id ? "Copied cURL" : "Copy cURL"}
                  </button>
                  <a
                    href={ep.sampleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary flex items-center gap-1 font-bold"
                  >
                    Live JSON <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Terms & Open License Callout */}
      <div className="p-6 border border-border bg-muted/10 space-y-2">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs text-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Fair Use & Open Data License
        </div>
        <p className="text-xs font-serif text-muted-foreground leading-relaxed">
          EconoNigeria data is offered under open principles. You are free to redistribute, analyze, and build commercial products upon these endpoints with appropriate attribution. We ask that automated bots cache responses reasonably and respect a maximum threshold of 60 requests per minute.
        </p>
        <div className="pt-2 text-xs font-mono">
          <a 
            href="https://github.com/israeleromon-lab/EcoNigeria" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline text-foreground font-bold hover:text-primary"
          >
            GitHub Repository & Community SDKs →
          </a>
        </div>
      </div>
    </div>
  );
}

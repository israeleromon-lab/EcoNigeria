import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INDICATORS } from "@/lib/constants";
import {
  Database,
  BrainCircuit,
  ShieldCheck,
  Scale,
  AlertTriangle,
  ExternalLink,
  GitCommit,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

export default function MethodologyPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Editorial Header */}
      <div className="border-b-4 border-foreground pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
          <span>INSTITUTIONAL PROVENANCE &amp; ECONOMETRIC SPECIFICATION</span>
          <span>//</span>
          <span>AUDIT v2.1</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tight mb-3">
          Sources, Methodology &amp; Structural Breaks
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-3xl font-serif leading-relaxed">
          EconoNigeria is engineered for empirical transparency and academic reproducibility.
          Below is our complete three-tier data sourcing architecture, primary institutional
          citations, structural break disclosures, and deterministic ETL validation rules.
        </p>
      </div>

      {/* Section 1: Three-Tier Sourcing Architecture & Primary Authorities */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border rounded-none shadow-none">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-base">
              <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Primary Institutional Authorities
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Multi-tier ingestion across domestic &amp; multilateral statistical agencies
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-muted-foreground leading-relaxed font-serif">
            <p className="text-foreground/90">
              Because Nigerian macroeconomic data spans real-time market windows, monthly
              domestic statistical bulletins, and annual multilateral accounts, EconoNigeria
              operates a <strong>Three-Tier Institutional Sourcing Architecture</strong> rather
              than relying on a single upstream API:
            </p>
            <ul className="space-y-3.5 list-disc pl-5">
              <li>
                <strong className="text-foreground font-sans">
                  1. Central Bank of Nigeria (CBN) &amp; FMDQ Exchange:
                </strong>{" "}
                Primary authority for monetary and external sector series, including{" "}
                <code className="font-mono text-xs text-foreground">FI.RES.TOTL.CD</code>{" "}
                (Gross External Reserves on a 30-day moving average basis),{" "}
                <code className="font-mono text-xs text-foreground">NGN_USD</code> (Official
                NAFEM / I&amp;E window closing exchange rate), Monetary Policy Rate (MPR)
                decisions, and Balance of Payments FDI compilations. Verified directly against{" "}
                <a
                  href="https://www.cbn.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-emerald-500"
                >
                  cbn.gov.ng
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground font-sans">
                  2. National Bureau of Statistics (NBS) &amp; Debt Management Office (DMO):
                </strong>{" "}
                Primary domestic authority for Consumer Price Index (
                <code className="font-mono text-xs text-foreground">FP.CPI.TOTL.ZG</code>),
                Real GDP Growth (
                <code className="font-mono text-xs text-foreground">NY.GDP.MKTP.KD.ZG</code>),
                Nigeria Labour Force Survey (
                <code className="font-mono text-xs text-foreground">SL.UEM.TOTL.ZS</code>),
                National Living Standards Survey (
                <code className="font-mono text-xs text-foreground">SI.POV.NAHC</code>), and
                Public Debt Stock (
                <code className="font-mono text-xs text-foreground">GC.DOD.TOTL.GD.ZS</code>).
                Because NBS and DMO publish monthly/quarterly statistical bulletins in PDF/Excel
                ahead of multilateral API propagation, structured extracts are cross-verified
                against{" "}
                <a
                  href="https://www.nigerianstat.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-emerald-500"
                >
                  nigerianstat.gov.ng
                </a>{" "}
                and{" "}
                <a
                  href="https://www.dmo.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-emerald-500"
                >
                  dmo.gov.ng
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground font-sans">
                  3. World Bank Open Data (WDI) &amp; IMF IFS:
                </strong>{" "}
                Provides standardized multi-decade (1960–present) annual series for cross-country
                comparability across GDP per Capita (
                <code className="font-mono text-xs text-foreground">NY.GDP.PCAP.CD</code>),
                Population (
                <code className="font-mono text-xs text-foreground">SP.POP.TOTL</code>), Net FDI
                (
                <code className="font-mono text-xs text-foreground">BX.KLT.DINV.CD.WD</code>),
                and ILO-harmonized labor series via{" "}
                <a
                  href="https://data.worldbank.org/country/nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-foreground hover:text-emerald-500"
                >
                  data.worldbank.org
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground font-sans">
                  4. Federal Reserve Economic Data (FRED) &amp; U.S. EIA:
                </strong>{" "}
                Maintained by the Federal Reserve Bank of St. Louis. Used for global external
                benchmarks governing Nigeria&apos;s fiscal and capital-account balances: Europe
                Brent Crude Spot Price FOB (
                <code className="font-mono text-xs text-foreground">DCOILBRENTEU</code>) and the
                Effective US Federal Funds Rate (
                <code className="font-mono text-xs text-foreground">FEDFUNDS</code>).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-none shadow-none">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ETL Pipeline, Cadence &amp; Validation Rules
            </CardTitle>
            <CardDescription className="font-mono text-xs">
              Deterministic sanity checks, temporal resolution &amp; null handling
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-muted-foreground leading-relaxed font-serif">
            <p className="text-foreground/90">
              Our Python (FastAPI + SQLAlchemy) ingestion engine enforces strict provenance
              tracking and deterministic validation rules before any observation is committed to
              PostgreSQL:
            </p>
            <ul className="space-y-3.5 list-disc pl-5">
              <li>
                <strong className="text-foreground font-sans">
                  Dual-Horizon Temporal Resolution (Spot vs. Annualized Series):
                </strong>{" "}
                High-frequency market indicators—specifically{" "}
                <code className="font-mono text-xs text-foreground">DCOILBRENTEU</code> (daily
                EIA Brent Spot) and{" "}
                <code className="font-mono text-xs text-foreground">FEDFUNDS</code> (monthly
                FOMC Effective Rate)—are tracked at their native frequency on the{" "}
                <strong>Dashboard KPI Matrix &amp; Operational Wire</strong>, while their
                multi-decade historical chart series (1960–present) are algorithmically
                aggregated into <strong>calendar-year arithmetic averages</strong> so cross-series
                regressions share a uniform annual index (<code className="font-mono text-xs">YYYY</code>).
                We never fabricate or synthetically tick intermediate values.
              </li>
              <li>
                <strong className="text-foreground font-sans">
                  Strict Null Preservation (Zero-Coercion Guard):
                </strong>{" "}
                Missing upstream observations are preserved as database{" "}
                <code className="font-mono text-xs text-foreground">NULL</code> values rather
                than zero-filled (<code className="font-mono text-xs">0.0</code>), preventing
                artificial drops in charts and econometric backtests.
              </li>
              <li>
                <strong className="text-foreground font-sans">
                  Variance &amp; Domain Circuit Breakers:
                </strong>{" "}
                The ETL adapter (<code className="font-mono text-xs">BaseAdapter.validate_observation</code>)
                rejects non-positive values (<code className="font-mono text-xs">&lt;= 0</code>)
                for strictly positive series (Population, GDP per Capita, Brent Oil, Exchange
                Rate, External Reserves) and triggers a variance quarantine if a single-period
                change exceeds indicator-specific bounds (e.g.,{" "}
                <code className="font-mono text-xs">&gt;30 percentage-point</code> single-period
                real GDP swing) unless flagged as a verified structural break.
              </li>
              <li>
                <strong className="text-foreground font-sans">
                  Periodic Survey Benchmarks &amp; Cited Micro-Simulations:
                </strong>{" "}
                For structural indicators where national household surveys occur every 5–10
                years—specifically <strong>Poverty Rate (`SI.POV.NAHC`)</strong>—the primary
                benchmark is the{" "}
                <strong>
                  NBS 2018/19 Nigerian Living Standards Survey (NLSS, 40.1% national headcount)
                </strong>
                , supplemented for post-2020 periods by cited{" "}
                <strong>World Bank Nigeria Development Update (NDU)</strong> and{" "}
                <strong>World Bank Macro Poverty Outlook (MPO)</strong> micro-simulation
                estimates.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Methodological Discontinuities & Structural Breaks */}
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-base">
            <GitCommit className="w-5 h-5 text-amber-500" />
            Methodological Discontinuities &amp; Structural Breaks
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            Critical regime shifts and definition changes in Nigerian macroeconomic time series
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border border-amber-500/30 bg-amber-500/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  1. 2023 NBS Unemployment Redefinition (SL.UEM.TOTL.ZS)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                  Q1 2023 BREAK
                </span>
              </div>
              <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                Prior to 2023, the National Bureau of Statistics (NBS) used a Nigeria-specific
                threshold classifying anyone working fewer than <strong>20 hours per week</strong>{" "}
                as unemployed (recording a headline rate of <strong>33.3% in Q4 2020</strong>). In{" "}
                <strong>Q1 2023</strong>, NBS launched the revised{" "}
                <em>Nigeria Labour Force Survey (NLFS)</em> adopting the{" "}
                <strong>ILO 19th ICLS standard</strong>, which classifies any person working{" "}
                <strong>&ge;1 hour per week</strong> for pay or profit as employed—shifting
                headline unemployment to <strong>4.1%–5.3% (2023–2024)</strong>. EconoNigeria&apos;s
                long-run historical series utilizes the harmonized ILO 1-hour series to maintain
                multi-decade continuity, while documenting both regimes on the Unemployment
                workbench.
              </p>
            </div>

            <div className="p-4 border border-indigo-500/30 bg-indigo-500/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  2. June 2023 CBN FX Unification (NGN_USD &amp; NY.GDP.PCAP.CD)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                  JUNE 2023 BREAK
                </span>
              </div>
              <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                On <strong>June 14, 2023</strong>, the Central Bank of Nigeria collapsed multiple
                segmented exchange rate windows into the unified{" "}
                <strong>Nigerian Autonomous Foreign Exchange Market (NAFEM)</strong> window. This
                structural regime shift moved the official exchange rate from ~461 NGN/USD to
                market-clearing levels (&gt;1,400 NGN/USD in 2024), which also creates a sharp
                accounting translation drop in USD-denominated{" "}
                <strong>GDP per Capita (`NY.GDP.PCAP.CD`)</strong> despite positive domestic
                constant-Naira GDP growth.
              </p>
            </div>

            <div className="p-4 border border-emerald-500/30 bg-emerald-500/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  3. National Accounts Rebasing (NY.GDP.MKTP.KD.ZG)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  2010 BASE YEAR
                </span>
              </div>
              <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                Nigeria&apos;s constant-price GDP growth series is anchored to the{" "}
                <strong>2010 Constant Basic Price</strong> base year (introduced in the April
                2014 rebasing from the legacy 1990 base year to capture telecommunications,
                digital services, and motion pictures). NBS has initiated a new National Accounts
                rebasing exercise (targeting a 2019 base year); historical series will be updated
                with dual-base comparison metadata once NBS finalizes the back-casted tables.
              </p>
            </div>

            <div className="p-4 border border-rose-500/30 bg-rose-500/[0.04] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  4. Annual Average CPI vs. Monthly Point-in-Time YoY (FP.CPI.TOTL.ZG)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 border border-rose-500/30 text-rose-600 dark:text-rose-400">
                  2009=100 BASE
                </span>
              </div>
              <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                Researchers comparing World Bank WDI inflation figures with monthly NBS CPI press
                releases should note a mathematical distinction: WDI{" "}
                <code className="font-mono text-[11px]">FP.CPI.TOTL.ZG</code> reports the{" "}
                <strong>12-month arithmetic average CPI</strong> relative to the prior year&apos;s
                12-month average, whereas monthly NBS CPI reports cite the{" "}
                <strong>point-in-time single-month YoY change</strong> (base: November 2009 =
                100). During rapid disinflation or acceleration, the two metrics diverge by
                150–400 bps.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Complete 12-Indicator Provenance & Citation Ledger */}
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-base">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                Complete 12-Series Institutional Provenance Ledger
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Direct 1-click traceability to primary statistical publications and API endpoints
              </CardDescription>
            </div>
            <Link
              href="/status"
              className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 border border-border hover:border-foreground transition-colors self-start"
            >
              View Live Pipeline Status &rarr;
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="p-3.5">Series / Code</th>
                <th className="p-3.5">Primary Publisher</th>
                <th className="p-3.5">Official Publication / Dataset</th>
                <th className="p-3.5">Cadence &amp; Base</th>
                <th className="p-3.5 text-right">Primary Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-serif">
              {INDICATORS.map((ind) => (
                <tr key={ind.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-3.5">
                    <Link
                      href={`/${ind.slug}`}
                      className="font-bold text-foreground hover:underline block font-sans"
                    >
                      {ind.name}
                    </Link>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {ind.id}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-foreground font-semibold">
                    {ind.publisher}
                  </td>
                  <td className="p-3.5 text-muted-foreground max-w-md">
                    <div>{ind.publicationName}</div>
                    {ind.structuralBreakNote && (
                      <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-sans">
                        <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" />
                        {ind.structuralBreakNote.split(":")[0]} documented
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">
                    <div className="text-foreground">{ind.nativeFrequency}</div>
                    <div className="text-muted-foreground text-[10px]">{ind.baseYear}</div>
                  </td>
                  <td className="p-3.5 text-right font-mono">
                    <a
                      href={ind.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 border border-border hover:border-foreground text-foreground transition-colors text-[10px] uppercase tracking-wider"
                    >
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Section 4: Forecasting Engine & Backtest Evaluation */}
      <Card className="bg-card border-border rounded-none shadow-none">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-base">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            Econometric &amp; Machine Learning Forecasting Architecture
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            Three-model ensemble with out-of-sample RMSE/MAPE backtesting and 80% confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4 text-sm text-muted-foreground leading-relaxed font-serif">
          <p className="text-foreground/90">
            Every forward projection on EconoNigeria is clearly demarcated from historical
            observations using dashed amber trajectories, shaded 80% uncertainty fan bands, and
            out-of-sample holdout backtest metrics (<code className="font-mono text-xs">RMSE</code>{" "}
            and <code className="font-mono text-xs">MAPE %</code>) evaluated over trailing
            holdout periods:
          </p>
          <div className="grid md:grid-cols-3 gap-4 pt-2 font-sans">
            <div className="p-4 bg-background border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  1. Prophet (Additive/Multiplicative)
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted text-foreground">
                  80% CI BANDS
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-serif leading-relaxed">
                Decomposes non-linear macro trends with changepoint priors suited for structural
                regime shifts. Generates the upper and lower 80% uncertainty bounds displayed on
                indicator charts.
              </p>
            </div>
            <div className="p-4 bg-background border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  2. ARIMA (p, d, q)
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted text-foreground">
                  STATIONARY BASE
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-serif leading-relaxed">
                Auto-Regressive Integrated Moving Average selected via AIC minimization after
                Augmented Dickey-Fuller (ADF) stationarity differencing. Anchors short-horizon
                mean-reverting dynamics.
              </p>
            </div>
            <div className="p-4 bg-background border border-border">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  3. Gradient Boosted Lag Trees (XGBoost)
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted text-foreground">
                  NON-LINEAR LAGS
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-serif leading-relaxed">
                Captures autoregressive lag interactions and momentum features. Combined with
                Prophet and ARIMA into a weighted consensus ensemble trajectory.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Strict Demarcation of Machine-Generated Summaries */}
      <Card className="bg-primary/5 border-2 border-primary/20 rounded-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary uppercase tracking-wider text-base">
            <Scale className="w-5 h-5" />
            Strict Demarcation of AI Synthesis vs. Empirical Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground/85 leading-relaxed font-serif">
          <p>
            EconoNigeria enforces a strict boundary between <strong>verified empirical data</strong>{" "}
            and <strong>machine-generated narrative synthesis</strong>. Every AI Analyst card and
            indicator summary block is explicitly badged as{" "}
            <code className="font-mono text-xs px-1.5 py-0.5 bg-background border border-border">
              MACHINE-GENERATED MACRO SUMMARY — GROUNDED ON VERIFIED NBS/CBN/WB DATA
            </code>
            .
          </p>
          <p className="flex items-start gap-2 text-xs text-muted-foreground font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Academic &amp; Policy Citation Standard:</strong> Never cite LLM-generated
              narrative summaries as primary statistical evidence. Use the{" "}
              <strong>Export CSV</strong> and <strong>Export JSON</strong> buttons on each
              indicator workbench or the 1-click primary source verification links above for
              direct institutional citations.
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

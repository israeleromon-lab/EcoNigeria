import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, LineChart, BrainCircuit, ShieldCheck, Scale } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sources & Methodology</h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          EconoNigeria is built on a foundation of academic rigor and transparent data collection. 
          Learn how we source, process, and forecast macroeconomic indicators.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Sources
            </CardTitle>
            <CardDescription>Primary authoritative institutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              We exclusively utilize verified, open-access institutional APIs to ensure data integrity and avoid hallucination.
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li>
                <strong className="text-foreground">World Bank Open Data:</strong> Provides core demographic and macroeconomic metrics including GDP, Population, Foreign Direct Investment, and Government Debt (Code mapping: <code>NY.GDP.PCAP.CD</code>, <code>SP.POP.TOTL</code>, etc).
              </li>
              <li>
                <strong className="text-foreground">Federal Reserve Economic Data (FRED):</strong> Maintained by the Federal Reserve Bank of St. Louis. Used for tracking global benchmarks that impact Nigeria's economy, specifically Brent Crude Oil Prices and the US Federal Funds Rate.
              </li>
              <li>
                <strong className="text-foreground">National Bureau of Statistics (NBS):</strong> Integrated for supplementary domestic metrics (e.g., granular inflation breakdowns) via consolidated proxy datasets.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              ETL Pipeline Integrity
            </CardTitle>
            <CardDescription>How we process raw data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Our backend operates a continuous Extract, Transform, Load (ETL) pipeline utilizing Python's Pandas and SQLAlchemy.
            </p>
            <ul className="space-y-3 list-disc pl-5">
              <li>
                <strong className="text-foreground">Aggregation:</strong> High-frequency datasets (like daily crude oil prices) are algorithmically aggregated into annual averages to match the temporal resolution of macroeconomic indicators.
              </li>
              <li>
                <strong className="text-foreground">Null Handling:</strong> Missing values are preserved as nulls rather than zero-filled, preventing artificial drops in time-series forecasting. Known gaps in institutional APIs (e.g., Poverty Rate) are supplemented using verified academic estimates.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              Forecasting Engine (Machine Learning)
            </CardTitle>
            <CardDescription>Predictive modeling architecture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              EconoNigeria utilizes an ensemble approach for macroeconomic forecasting, balancing classical econometrics with modern machine learning:
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-background border border-border/50">
                <h4 className="font-semibold text-foreground mb-1">Prophet (Meta)</h4>
                <p className="text-xs">Decomposes time series into trend, seasonality, and holiday effects. Highly robust to missing data and trend shifts, making it ideal for developing economies.</p>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border/50">
                <h4 className="font-semibold text-foreground mb-1">ARIMA</h4>
                <p className="text-xs">Auto-Regressive Integrated Moving Average. The academic gold standard for short-term stationary time series forecasting. Provides rigorous confidence intervals.</p>
              </div>
              <div className="p-4 rounded-lg bg-background border border-border/50">
                <h4 className="font-semibold text-foreground mb-1">XGBoost</h4>
                <p className="text-xs">Gradient boosted decision trees used for feature-based prediction, specifically capturing non-linear relationships between independent economic variables.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Scale className="w-5 h-5" />
              AI Analyst Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground/80 leading-relaxed">
            <p>
              The <strong>AI Economic Analyst</strong> utilizes Large Language Models (LLMs) to synthesize data trends into readable executive summaries. While the AI is strictly prompted to base its analysis <em>only</em> on the hard data provided by the EconoNigeria database, AI models can occasionally produce hallucinated inferences regarding causal relationships. 
            </p>
            <p>
              <strong>Academic use:</strong> AI-generated insights should be used as a starting point for research, not as primary citations. Always refer to the raw data charts and exported CSVs for authoritative figures.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

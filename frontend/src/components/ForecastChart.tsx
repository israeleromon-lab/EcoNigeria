"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchForecastData } from "@/lib/api";
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Line,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndicatorValue } from "@/lib/utils";
import { MACRO_EVENTS } from "@/lib/events";

interface ForecastChartProps {
  indicatorCode: string;
  indicatorName: string;
  indicatorSlug?: string;
  unit: string;
  historicalData: any[];
  color: string;
  showEvents?: boolean;
  highlightedYear?: string | null;
}

export function ForecastChart({
  indicatorCode,
  indicatorSlug,
  unit,
  historicalData,
  color,
  showEvents = true,
  highlightedYear = null,
}: ForecastChartProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["forecast", indicatorCode],
    queryFn: () => fetchForecastData(indicatorCode, 5),
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[380px] rounded-none" />;
  }

  if (isError || !data || !data.data || !data.data.forecast) {
    return (
      <div className="w-full h-[380px] flex items-center justify-center border border-dashed rounded-none text-muted-foreground font-mono text-xs">
        Forecast trajectory unavailable for this series
      </div>
    );
  }

  const backtest = data.data.backtest;

  // Combine historical data and forecast data
  const chartData = [...historicalData];

  // Format forecast data
  const forecastItems = data.data.forecast.map((f: any) => ({
    year: String(f.period),
    value: null,
    forecast: f.ensemble_value,
    prophet_upper: f.prophet_upper,
    prophet_lower: f.prophet_lower,
  }));

  chartData.push(...forecastItems);

  // Link the last historical point to the forecast line to make it continuous
  if (historicalData.length > 0) {
    const lastHistorical = historicalData[historicalData.length - 1];
    const transitionPoint = {
      year: String(lastHistorical.year),
      value: lastHistorical.value,
      forecast: lastHistorical.value,
      prophet_upper: lastHistorical.value,
      prophet_lower: lastHistorical.value,
    };
    chartData[historicalData.length - 1] = transitionPoint;
  }

  // Identify visible events on this chart's timeline
  const visibleYears = new Set(chartData.map((d) => String(d.year)));
  const relevantEvents = MACRO_EVENTS.filter((e) => {
    const isYearVisible = visibleYears.has(String(e.year));
    const isRelevantToIndicator =
      !indicatorSlug ||
      e.indicators.includes(indicatorSlug) ||
      e.indicators.length > 3;
    return isYearVisible && isRelevantToIndicator;
  });

  // Custom rich tooltip including economic milestone details & 80% CI range
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const event = MACRO_EVENTS.find((e) => String(e.year) === String(label));
    const rowData = payload[0]?.payload;
    const isForecastOnly =
      rowData && rowData.value == null && rowData.forecast != null;

    return (
      <div className="bg-card border-2 border-foreground p-3 shadow-lg rounded-none text-xs font-serif max-w-xs z-50">
        <div className="flex items-center justify-between gap-3 font-bold text-foreground mb-1 text-sm border-b border-border pb-1 font-mono uppercase tracking-wider">
          <span>Period: {label}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 ${
              isForecastOnly
                ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
            }`}
          >
            {isForecastOnly ? "ML PROJECTION" : "EMPIRICAL"}
          </span>
        </div>

        <div className="space-y-1 my-2">
          {rowData?.value != null && (
            <div className="flex justify-between gap-4 font-sans text-xs">
              <span className="text-muted-foreground">Historical Value:</span>
              <span className="font-bold font-mono" style={{ color }}>
                {formatIndicatorValue(rowData.value, unit)}
              </span>
            </div>
          )}
          {isForecastOnly && rowData?.forecast != null && (
            <>
              <div className="flex justify-between gap-4 font-sans text-xs">
                <span className="text-muted-foreground">Ensemble Forecast:</span>
                <span className="font-bold font-mono text-amber-500">
                  {formatIndicatorValue(rowData.forecast, unit)}
                </span>
              </div>
              {rowData.prophet_lower != null && rowData.prophet_upper != null && (
                <div className="flex justify-between gap-4 font-sans text-[11px] pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">80% CI Bounds:</span>
                  <span className="font-mono text-muted-foreground">
                    [{formatIndicatorValue(rowData.prophet_lower, unit)} &mdash;{" "}
                    {formatIndicatorValue(rowData.prophet_upper, unit)}]
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {event && (
          <div className="mt-2 pt-2 border-t border-border bg-muted/20 p-2">
            <div
              className="flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-wider"
              style={{ color: event.color }}
            >
              <span>⚡ {event.category}:</span>
            </div>
            <p className="text-foreground text-xs mt-0.5 font-sans font-bold">
              {event.title}
            </p>
            <p className="text-muted-foreground text-[11px] mt-1 leading-snug font-serif italic">
              &ldquo;{event.description}&rdquo;
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="h-[380px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 24, right: 20, left: 4, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#888888"
              strokeOpacity={0.25}
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              minTickGap={35}
              tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#888888", fontSize: 11, fontFamily: "monospace" }}
              tickFormatter={(val) => {
                const num = Number(val);
                if (isNaN(num)) return String(val);
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
                fontSize: "11px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                paddingBottom: "10px",
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorForecast)"
              name="Empirical Historical"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#eab308"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              name="ML Ensemble Forecast (5Y)"
            />
            <Line
              type="monotone"
              dataKey="prophet_upper"
              stroke="#eab308"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              opacity={0.45}
              name="80% Confidence Band"
            />
            <Line
              type="monotone"
              dataKey="prophet_lower"
              stroke="#eab308"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              opacity={0.45}
              legendType="none"
              name="Lower Bound"
            />

            {showEvents &&
              relevantEvents.map((evt) => {
                const isHighlighted = highlightedYear === evt.year;
                return (
                  <ReferenceLine
                    key={evt.id}
                    x={String(evt.year)}
                    stroke={evt.color}
                    strokeWidth={isHighlighted ? 2.5 : 1.5}
                    strokeOpacity={isHighlighted ? 1 : 0.45}
                    strokeDasharray={isHighlighted ? "none" : "3 3"}
                    label={
                      isHighlighted
                        ? {
                            value: `${evt.year}: ${evt.shortTitle}`,
                            position: "insideTopRight",
                            fill: evt.color,
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "monospace",
                          }
                        : undefined
                    }
                  />
                );
              })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Out-of-Sample Backtest & Uncertainty Demarcation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border border-border bg-muted/15 text-[11px] font-mono text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <strong className="text-foreground">MODEL:</strong> Prophet + ARIMA + XGBoost
          </span>
          <span>·</span>
          <span>
            <strong className="text-foreground">BANDS:</strong> 80% Confidence Interval
          </span>
          {backtest && (
            <>
              <span>·</span>
              <span>
                <strong className="text-foreground">HOLDOUT RMSE:</strong>{" "}
                {formatIndicatorValue(Number(backtest.rmse), unit)}
              </span>
              <span>·</span>
              <span>
                <strong className="text-foreground">MAPE:</strong>{" "}
                {Number(backtest.mape).toFixed(1)}%
              </span>
            </>
          )}
        </div>
        {backtest?.accuracy_grade && (
          <span
            className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border font-bold ${
              backtest.accuracy_grade === "High"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                : backtest.accuracy_grade === "Moderate"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                : "border-rose-500/40 bg-rose-500/10 text-rose-500"
            }`}
          >
            Backtest Accuracy: {backtest.accuracy_grade} ({backtest.test_periods}Y Holdout)
          </span>
        )}
      </div>
    </div>
  );
}

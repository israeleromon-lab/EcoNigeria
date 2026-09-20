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
  ReferenceLine 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndicatorValue } from "@/lib/utils";
import { MACRO_EVENTS, MacroEvent } from "@/lib/events";

interface ForecastChartProps {
  indicatorCode: string;
  indicatorName: string;
  indicatorSlug?: string;
  unit: string;
  historicalData: any[]; // The data we already fetched for the historical chart
  color: string;
  showEvents?: boolean;
  highlightedYear?: string | null;
}

export function ForecastChart({ 
  indicatorCode, 
  indicatorName, 
  indicatorSlug,
  unit, 
  historicalData, 
  color,
  showEvents = true,
  highlightedYear = null
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
      <div className="w-full h-[380px] flex items-center justify-center border border-dashed rounded-none text-muted-foreground">
        Forecast not available
      </div>
    );
  }

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

  // Append forecasts
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
  const visibleYears = new Set(chartData.map(d => String(d.year)));
  const relevantEvents = MACRO_EVENTS.filter(e => {
    const isYearVisible = visibleYears.has(String(e.year));
    const isRelevantToIndicator = !indicatorSlug || e.indicators.includes(indicatorSlug) || e.indicators.length > 3;
    return isYearVisible && isRelevantToIndicator;
  });

  // Custom rich tooltip including economic milestone details
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const event = MACRO_EVENTS.find(e => String(e.year) === String(label));

    return (
      <div className="bg-card border-2 border-foreground p-3 shadow-lg rounded-none text-xs font-serif max-w-xs z-50">
        <div className="font-bold text-foreground mb-1 text-sm border-b border-border pb-1 font-mono uppercase tracking-wider">
          Period: {label}
        </div>
        
        <div className="space-y-1 my-2">
          {payload.map((entry: any, index: number) => {
            if (entry.value == null) return null;
            const formatted = formatIndicatorValue(entry.value, unit);
            return (
              <div key={index} className="flex justify-between gap-4 font-sans text-xs">
                <span className="text-muted-foreground">{entry.name}:</span>
                <span className="font-bold font-serif" style={{ color: entry.color }}>{formatted}</span>
              </div>
            );
          })}
        </div>

        {event && (
          <div className="mt-2 pt-2 border-t border-border bg-muted/20 p-2">
            <div className="flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-wider" style={{ color: event.color }}>
              <span>⚡ {event.category}:</span>
            </div>
            <p className="text-foreground text-xs mt-0.5 font-sans font-bold">{event.title}</p>
            <p className="text-muted-foreground text-[11px] mt-1 leading-snug font-serif italic">
              "{event.description}"
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[380px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 15, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="year" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'monospace' }}
            dy={8}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'monospace' }}
            tickFormatter={(val) => {
              if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
              if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
              if (val >= 1e3) return `${(val / 1e3).toFixed(0)}K`;
              return val;
            }}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            fillOpacity={1} 
            fill={`url(#colorForecast)`} 
            name="Historical"
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#eab308" 
            strokeWidth={2.5} 
            strokeDasharray="5 5" 
            dot={false}
            name="Forecast"
          />
          <Line 
            type="monotone" 
            dataKey="prophet_upper" 
            stroke="#eab308" 
            strokeWidth={1} 
            strokeDasharray="3 3" 
            dot={false}
            opacity={0.4}
            name="Upper Bound"
          />
          <Line 
            type="monotone" 
            dataKey="prophet_lower" 
            stroke="#eab308" 
            strokeWidth={1} 
            strokeDasharray="3 3" 
            dot={false}
            opacity={0.4}
            name="Lower Bound"
          />

          {/* Render event milestone lines */}
          {showEvents && relevantEvents.map((evt) => {
            const isHighlighted = highlightedYear === evt.year;
            return (
              <ReferenceLine
                key={evt.id}
                x={String(evt.year)}
                stroke={evt.color}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={isHighlighted ? "none" : "3 3"}
                label={{
                  value: evt.shortTitle,
                  position: "insideTopLeft",
                  fill: evt.color,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "sans-serif",
                }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

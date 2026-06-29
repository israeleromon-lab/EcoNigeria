"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchForecastData } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndicatorValue } from "@/lib/utils";

interface ForecastChartProps {
  indicatorCode: string;
  indicatorName: string;
  unit: string;
  historicalData: any[]; // The data we already fetched for the historical chart
  color: string;
}

export function ForecastChart({ indicatorCode, indicatorName, unit, historicalData, color }: ForecastChartProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["forecast", indicatorCode],
    queryFn: () => fetchForecastData(indicatorCode, 5),
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] rounded-xl" />;
  }

  if (isError || !data || !data.data || !data.data.forecast) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
        Forecast not available
      </div>
    );
  }

  // Combine historical data and forecast data
  const chartData = [...historicalData];
  
  // Format forecast data
  const forecastItems = data.data.forecast.map((f: any) => ({
    year: f.date,
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
      year: lastHistorical.year,
      value: lastHistorical.value,
      forecast: lastHistorical.value,
      prophet_upper: lastHistorical.value,
      prophet_lower: lastHistorical.value,
    };
    // Replace the last historical point with the transition point
    chartData[historicalData.length - 1] = transitionPoint;
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(val) => {
              if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`;
              if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`;
              return val;
            }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: any, name: string) => {
              const formatted = formatIndicatorValue(value as number, unit);
              if (name === 'value') return [formatted, 'Historical'];
              if (name === 'forecast') return [formatted, 'Ensemble Forecast'];
              if (name === 'prophet_upper') return [formatted, 'Upper Bound'];
              if (name === 'prophet_lower') return [formatted, 'Lower Bound'];
              return [formatted, name];
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
          />
          <Legend verticalAlign="top" height={36}/>
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
            strokeWidth={3} 
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
            opacity={0.5}
            name="Upper Bound"
          />
          <Line 
            type="monotone" 
            dataKey="prophet_lower" 
            stroke="#eab308" 
            strokeWidth={1} 
            strokeDasharray="3 3" 
            dot={false}
            opacity={0.5}
            name="Lower Bound"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SparklineInputPoint {
  period?: string;
  value?: number | null;
}

export interface InlineSparklineProps {
  data?: Array<number | SparklineInputPoint> | null;
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function extractSparklineNumbers(
  data?: Array<number | SparklineInputPoint> | null
): { values: number[]; firstPeriod?: string; lastPeriod?: string } {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { values: [] };
  }

  const values: number[] = [];
  let firstPeriod: string | undefined;
  let lastPeriod: string | undefined;

  for (const item of data) {
    if (typeof item === "number" && !isNaN(item)) {
      values.push(item);
    } else if (item && typeof item === "object" && item.value != null && !isNaN(Number(item.value))) {
      values.push(Number(item.value));
      if (!firstPeriod && item.period) firstPeriod = String(item.period);
      if (item.period) lastPeriod = String(item.period);
    }
  }

  return { values, firstPeriod, lastPeriod };
}

/**
 * Tight, unembellished 40px inline SVG sparkline.
 * Single-accent or monochrome stroke line, zero noisy area gradient under fills.
 */
export function InlineSparkline({
  data,
  color = "#10b981",
  height = 40,
  width = 160,
  className,
}: InlineSparklineProps) {
  const { values, firstPeriod, lastPeriod } = extractSparklineNumbers(data);

  if (values.length < 2) {
    return (
      <div
        className={cn(
          "flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 border-t border-dashed border-white/10 pt-2",
          className
        )}
        style={{ height }}
      >
        <span>NO TRAILING SERIES</span>
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min === 0 ? 1 : max - min;

  const padX = 4;
  const padY = 5;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = values.map((val, idx) => {
    const x = padX + (idx / (values.length - 1)) * innerW;
    const y = padY + innerH - ((val - min) / range) * innerH;
    return { x, y, val };
  });

  const pointsAttr = coords
    .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(" ");

  const firstPt = coords[0];
  const lastPt = coords[coords.length - 1];

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="overflow-visible block"
        role="img"
        aria-label="Trailing historical trend sparkline"
      >
        {/* Subtle start-value reference hairline (no area gradient fill) */}
        <line
          x1={padX}
          y1={firstPt.y}
          x2={width - padX}
          y2={firstPt.y}
          stroke="currentColor"
          className="text-foreground/15"
          strokeWidth={0.75}
          strokeDasharray="2 2"
        />

        {/* Crisp single-accent trajectory polyline */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsAttr}
        />

        {/* Terminal observation anchor dot */}
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r={2.2}
          fill={color}
        />
      </svg>

      {(firstPeriod || lastPeriod) && (
        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/70 tracking-wider mt-0.5">
          <span>{firstPeriod}</span>
          <span>{values.length} OBS</span>
          <span>{lastPeriod}</span>
        </div>
      )}
    </div>
  );
}

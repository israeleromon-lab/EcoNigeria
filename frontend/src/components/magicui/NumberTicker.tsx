"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NumberTickerProps {
  value: number;
  formatter?: (val: number) => string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /**
   * The "Drag Bypass" Rule:
   * When true (e.g. while dragging a scenario slider), kills the spring entirely
   * and renders raw frame-to-frame numbers with zero latency.
   * When false (e.g. on slider release or automated scenario preset), runs the
   * overdamped spring roll ({ stiffness: 260, damping: 32 }).
   */
  bypassSpring?: boolean;
  className?: string;
}

export function NumberTicker({
  value,
  formatter,
  decimals = 2,
  prefix = "",
  suffix = "",
  bypassSpring = false,
  className,
}: NumberTickerProps) {
  const formatVal = (v: number): string => {
    if (v === null || v === undefined || isNaN(v)) return "-";
    if (formatter) return formatter(v);
    return `${prefix}${v.toFixed(decimals)}${suffix}`;
  };

  const motionValue = useMotionValue(value);
  // Overdamped spring: fast mechanical attack, hydraulic resistance, zero bounce/overshoot
  const springValue = useSpring(motionValue, {
    stiffness: 260,
    damping: 32,
  });

  const [displayText, setDisplayText] = useState<string>(() => formatVal(value));
  const formatterRef = useRef(formatVal);
  formatterRef.current = formatVal;

  useEffect(() => {
    if (bypassSpring) {
      // Kill spring lag immediately while dragging
      motionValue.jump(value);
      springValue.jump(value);
      setDisplayText(formatterRef.current(value));
    } else {
      motionValue.set(value);
    }
  }, [value, bypassSpring, motionValue, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (!bypassSpring) {
        setDisplayText(formatterRef.current(latest));
      }
    });
    return () => unsubscribe();
  }, [springValue, bypassSpring]);

  return (
    <span
      className={cn(
        "inline-block font-mono tabular-nums lining-nums tracking-tight",
        className
      )}
      style={{
        fontVariantNumeric: "tabular-nums lining-nums",
        fontFeatureSettings: '"tnum" 1, "lnum" 1, "zero" 1',
      }}
    >
      {bypassSpring ? formatVal(value) : displayText}
    </span>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MacroPulseStatus = "Resilient" | "Moderate" | "Strained" | "Vulnerable";

export interface BorderBeamProps {
  /**
   * Semantic status from Nigeria's Economic Pulse:
   * - Emerald (#10b981): Resilient / Expansionary
   * - Amber (#f59e0b): Moderate Pressure / Stagnation
   * - Crimson/Rose (#f43f5e): High Volatility / Critical Distress
   */
  status?: MacroPulseStatus | string;
  /**
   * Slow, subdued perimeter cycle (10–14 seconds default 12s)
   * so it reads as an ambient diagnostic sweep rather than a neon storefront sign.
   */
  duration?: number;
  colorOverride?: string;
  className?: string;
}

export function getSemanticBeamColor(status?: string): string {
  switch (status) {
    case "Resilient":
      return "#10b981"; // Emerald: Resilient / Expansionary
    case "Moderate":
    case "Strained":
      return "#f59e0b"; // Amber: Moderate Pressure / Stagnation
    case "Vulnerable":
    default:
      return "#f43f5e"; // Crimson/Rose: High Volatility / Critical Distress
  }
}

export function BorderBeam({
  status = "Strained",
  duration = 12,
  colorOverride,
  className,
}: BorderBeamProps) {
  const beamColor = colorOverride || getSemanticBeamColor(status);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden z-10",
        className
      )}
    >
      {/* Top perimeter sweep */}
      <motion.div
        className="absolute top-0 left-0 h-[1.5px] w-36"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${beamColor} 70%, transparent 100%)`,
          opacity: 0.75,
        }}
        animate={{
          left: ["-15%", "105%"],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Right perimeter sweep */}
      <motion.div
        className="absolute top-0 right-0 w-[1.5px] h-28"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${beamColor} 70%, transparent 100%)`,
          opacity: 0.65,
        }}
        animate={{
          top: ["-20%", "105%"],
        }}
        transition={{
          duration: duration,
          delay: duration * 0.25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Bottom perimeter sweep */}
      <motion.div
        className="absolute bottom-0 right-0 h-[1.5px] w-36"
        style={{
          background: `linear-gradient(270deg, transparent 0%, ${beamColor} 70%, transparent 100%)`,
          opacity: 0.75,
        }}
        animate={{
          right: ["-15%", "105%"],
        }}
        transition={{
          duration: duration,
          delay: duration * 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Left perimeter sweep */}
      <motion.div
        className="absolute bottom-0 left-0 w-[1.5px] h-28"
        style={{
          background: `linear-gradient(0deg, transparent 0%, ${beamColor} 70%, transparent 100%)`,
          opacity: 0.65,
        }}
        animate={{
          bottom: ["-20%", "105%"],
        }}
        transition={{
          duration: duration,
          delay: duration * 0.75,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

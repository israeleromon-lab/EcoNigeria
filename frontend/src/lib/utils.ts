import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num === null || num === undefined) return "-";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
}

export function formatCurrency(num: number): string {
  if (num === null || num === undefined) return "-";
  if (Math.abs(num) >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (Math.abs(num) >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(num: number): string {
  if (num === null || num === undefined) return "-";
  return num.toFixed(2) + "%";
}

export function formatNaira(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return (
    "₦" +
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  );
}

export function formatIndicatorValue(value: number, unit: string): string {
  if (value === null || value === undefined || isNaN(value)) return "-";
  const u = (unit || "").toLowerCase();
  if (u === "ngn" || u.includes("naira") || u.includes("ngn/usd") || u.includes("ngn per usd")) {
    return formatNaira(value);
  }
  if (u.includes("usd") || u.includes("$") || u.includes("currency")) {
    return formatCurrency(value);
  }
  if (u.includes("%") || u.includes("rate") || u.includes("percent")) {
    return formatPercent(value);
  }
  return formatNumber(value);
}

export function formatChange(pct: number): { text: string; color: string; icon: string } {
  if (pct === null || pct === undefined || isNaN(pct)) return { text: "-", color: "text-muted-foreground", icon: "" };
  if (pct > 0) return { text: `+${pct.toFixed(2)}%`, color: "text-emerald-500", icon: "▲" };
  if (pct < 0) return { text: `${pct.toFixed(2)}%`, color: "text-rose-500", icon: "▼" };
  return { text: "0.00%", color: "text-muted-foreground", icon: "−" };
}

export function getCadenceSuffix(frequency?: string | null): string {
  switch ((frequency || "").toLowerCase()) {
    case "daily":
      return "DoD";
    case "monthly":
      return "MoM";
    case "quarterly":
      return "QoQ";
    case "annual":
    default:
      return "YoY";
  }
}

export function formatInlineDelta(options: {
  currentValue?: number | null;
  previousValue?: number | null;
  pctChange?: number | null;
  bpsChange?: number | null;
  unit?: string | null;
  frequency?: string | null;
  indicatorCode?: string;
}): {
  text: string;
  shortText: string;
  icon: string;
  direction: "up" | "down" | "flat";
  badgeClass: string;
  textClass: string;
} {
  const { currentValue, previousValue, pctChange, bpsChange, unit, frequency, indicatorCode } = options;
  const cadence = getCadenceSuffix(frequency);
  const u = (unit || "").toLowerCase();
  const isRateUnit = u.includes("%") || u.includes("percent");

  // Compute bps for rate/percentage indicators if both values exist
  let computedBps = bpsChange;
  if (
    computedBps == null &&
    isRateUnit &&
    currentValue != null &&
    previousValue != null
  ) {
    computedBps = Math.round((currentValue - previousValue) * 100);
  }

  // Indicators where an upward move represents macro pressure/distress
  const inversePolarity = new Set([
    "FP.CPI.TOTL.ZG",
    "SL.UEM.TOTL.ZS",
    "GC.DOD.TOTL.GD.ZS",
    "SI.POV.NAHC",
    "NGN_USD",
  ]);
  const isInverse = indicatorCode ? inversePolarity.has(indicatorCode) : false;

  if (isRateUnit && computedBps != null && !isNaN(computedBps)) {
    const dir: "up" | "down" | "flat" =
      computedBps > 0 ? "up" : computedBps < 0 ? "down" : "flat";
    const sign = computedBps > 0 ? "+" : "";
    const shortText = `${sign}${computedBps} bps`;
    const text = `${shortText} ${cadence}`;
    const icon = dir === "up" ? "▲" : dir === "down" ? "▼" : "−";

    const isPositiveSignal =
      dir === "flat" ? null : isInverse ? dir === "down" : dir === "up";

    return {
      text,
      shortText,
      icon,
      direction: dir,
      badgeClass:
        isPositiveSignal === null
          ? "border-white/10 bg-white/[0.03] text-muted-foreground"
          : isPositiveSignal
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-rose-500/30 bg-rose-500/10 text-rose-400",
      textClass:
        dir === "up"
          ? "text-emerald-400"
          : dir === "down"
          ? "text-rose-400"
          : "text-muted-foreground",
    };
  }

  const pct = pctChange ?? 0;
  if (pctChange == null || isNaN(pct)) {
    return {
      text: `0.0% ${cadence}`,
      shortText: "0.0%",
      icon: "−",
      direction: "flat",
      badgeClass: "border-white/10 bg-white/[0.03] text-muted-foreground",
      textClass: "text-muted-foreground",
    };
  }

  const dir: "up" | "down" | "flat" = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  const sign = pct > 0 ? "+" : "";
  const shortText = `${sign}${pct.toFixed(2)}%`;
  const text = `${shortText} ${cadence}`;
  const icon = dir === "up" ? "▲" : dir === "down" ? "▼" : "−";
  const isPositiveSignal =
    dir === "flat" ? null : isInverse ? dir === "down" : dir === "up";

  return {
    text,
    shortText,
    icon,
    direction: dir,
    badgeClass:
      isPositiveSignal === null
        ? "border-white/10 bg-white/[0.03] text-muted-foreground"
        : isPositiveSignal
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
        : "border-rose-500/30 bg-rose-500/10 text-rose-400",
    textClass:
      dir === "up"
        ? "text-emerald-400"
        : dir === "down"
        ? "text-rose-400"
        : "text-muted-foreground",
  };
}


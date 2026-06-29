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

export function formatIndicatorValue(value: number, unit: string): string {
  if (value === null || value === undefined) return "-";
  if (unit.toLowerCase().includes("usd") || unit.toLowerCase().includes("$") || unit.toLowerCase().includes("currency")) {
    return formatCurrency(value);
  }
  if (unit.toLowerCase().includes("%") || unit.toLowerCase().includes("rate") || unit.toLowerCase().includes("percent")) {
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

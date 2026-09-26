"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { fetchDashboardData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { cn, formatIndicatorValue, formatInlineDelta } from "@/lib/utils";

interface TickerItemMeta {
  shortTag: string;
  provenance: string;
  cadenceTag: string;
  isDailyMarket?: boolean;
}

const TICKER_META_MAP: Record<string, TickerItemMeta> = {
  DCOILBRENTEU: {
    shortTag: "BRENT CRUDE",
    provenance: "EIA · FRED",
    cadenceTag: "SPOT/ANN",
    isDailyMarket: true,
  },
  NGN_USD: {
    shortTag: "NGN/USD NAFEM",
    provenance: "CBN · FMDQ",
    cadenceTag: "DAILY",
    isDailyMarket: true,
  },
  "FI.RES.TOTL.CD": {
    shortTag: "EXT RESERVES",
    provenance: "CBN",
    cadenceTag: "30D-MA",
  },
  "FP.CPI.TOTL.ZG": {
    shortTag: "CPI INFLATION",
    provenance: "NBS · WB",
    cadenceTag: "YO-Y",
  },
  "NY.GDP.MKTP.KD.ZG": {
    shortTag: "REAL GDP",
    provenance: "NBS · WB",
    cadenceTag: "CONST-2010",
  },
  FEDFUNDS: {
    shortTag: "FED FUNDS",
    provenance: "FRED · H.15",
    cadenceTag: "EFFR",
    isDailyMarket: true,
  },
  "GC.DOD.TOTL.GD.ZS": {
    shortTag: "DEBT / GDP",
    provenance: "DMO · WB",
    cadenceTag: "ANNUAL",
  },
  "BX.KLT.DINV.CD.WD": {
    shortTag: "NET FDI",
    provenance: "CBN · WB",
    cadenceTag: "BPM6",
  },
  "NY.GDP.PCAP.CD": {
    shortTag: "GDP / CAPITA",
    provenance: "WB · NBS",
    cadenceTag: "USD",
  },
  "SL.UEM.TOTL.ZS": {
    shortTag: "UNEMPLOYMENT",
    provenance: "NBS · ILO",
    cadenceTag: "ILO-19",
  },
  "SI.POV.NAHC": {
    shortTag: "POVERTY HEADCOUNT",
    provenance: "NBS · WB",
    cadenceTag: "NLSS",
  },
  "SP.POP.TOTL": {
    shortTag: "POPULATION",
    provenance: "NPC · WB",
    cadenceTag: "ANNUAL",
  },
};

// Priority operational ordering so core Nigerian macro signals lead the tape
const TICKER_PRIORITY_ORDER = [
  "DCOILBRENTEU",
  "NGN_USD",
  "FI.RES.TOTL.CD",
  "FP.CPI.TOTL.ZG",
  "NY.GDP.MKTP.KD.ZG",
  "GC.DOD.TOTL.GD.ZS",
  "FEDFUNDS",
  "BX.KLT.DINV.CD.WD",
  "NY.GDP.PCAP.CD",
  "SL.UEM.TOTL.ZS",
  "SI.POV.NAHC",
  "SP.POP.TOTL",
];

export function MacroTickerTape() {
  const router = useRouter();
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 45000,
  });

  // Track real backend value updates for transient 400ms directional flash-highlights.
  // Zero synthetic or interpolated ticks — values strictly reflect verified database records.
  const [flashState, setFlashState] = useState<Record<string, "up" | "down">>({});
  const prevValuesRef = useRef<Record<string, number>>({});
  const flashTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const triggerDirectionalFlash = useCallback((code: string, direction: "up" | "down") => {
    if (flashTimersRef.current[code]) {
      clearTimeout(flashTimersRef.current[code]);
    }
    setFlashState((prev) => ({ ...prev, [code]: direction }));
    flashTimersRef.current[code] = setTimeout(() => {
      setFlashState((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    }, 400);
  }, []);

  // Detect real backend data changes and fire 400ms directional flash
  useEffect(() => {
    if (!data?.indicators) return;
    for (const item of data.indicators) {
      if (item.current_value == null) continue;
      const prev = prevValuesRef.current[item.code];
      if (prev !== undefined && prev !== item.current_value) {
        triggerDirectionalFlash(
          item.code,
          item.current_value > prev ? "up" : "down"
        );
      }
      prevValuesRef.current[item.code] = item.current_value;
    }
  }, [data, triggerDirectionalFlash]);

  useEffect(() => {
    const timers = flashTimersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const handleSelectMetric = (code: string, slug: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("econonigeria:select-metric", {
          detail: { code, slug },
        })
      );
    }

    if (pathname === "/") {
      const cardEl = document.getElementById(`kpi-${slug}`);
      const chartEl = document.getElementById("dashboard-primary-chart");
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (chartEl) {
        chartEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push(`/?metric=${slug}#kpi-${slug}`);
    }
  };

  // Build ordered operational items
  const orderedConfigs = TICKER_PRIORITY_ORDER.map((code) =>
    INDICATORS.find((i) => i.id === code)
  ).filter(Boolean) as typeof INDICATORS;

  const renderTickerItem = (indicator: (typeof INDICATORS)[number], copyKey: string) => {
    const stat = data?.indicators?.find((d: any) => d.code === indicator.id);
    const meta = TICKER_META_MAP[indicator.id] || {
      shortTag: indicator.name.toUpperCase(),
      provenance: indicator.publisher,
      cadenceTag: indicator.nativeFrequency,
    };

    // Use live backend observation if hydrated, otherwise verified institutional baseline
    const currentVal = stat?.current_value ?? indicator.baselineValue ?? null;
    const currentPeriod = stat?.current_period ?? indicator.baselinePeriod;
    const formattedVal =
      currentVal != null
        ? formatIndicatorValue(currentVal, indicator.unit)
        : "—";

    const delta = formatInlineDelta({
      currentValue: currentVal,
      previousValue: stat?.previous_value,
      pctChange: stat?.pct_change,
      bpsChange: stat?.bps_change,
      unit: indicator.unit,
      frequency: stat?.native_frequency,
      indicatorCode: indicator.id,
    });

    const isStale = Boolean(stat?.is_stale);
    const flashDir = flashState[indicator.id];

    const asOfLabel = `${meta.provenance} · ${currentPeriod} (${meta.cadenceTag})`;

    return (
      <button
        key={`${copyKey}-${indicator.id}`}
        type="button"
        onClick={() => handleSelectMetric(indicator.id, indicator.slug)}
        title={`Jump to ${indicator.name} (${asOfLabel})`}
        className={cn(
          "group inline-flex items-center gap-2 px-3.5 h-8 border-r border-neutral-800/90 text-[11px] font-mono tabular-nums whitespace-nowrap cursor-pointer text-left",
          flashDir === "up" &&
            "bg-emerald-500/25 text-emerald-200 ring-1 ring-inset ring-emerald-500/50 transition-none",
          flashDir === "down" &&
            "bg-rose-500/25 text-rose-200 ring-1 ring-inset ring-rose-500/50 transition-none",
          !flashDir &&
            "transition-colors duration-300 hover:bg-[#111622] focus-visible:outline-none focus-visible:bg-[#111622]",
          isStale && !flashDir && "opacity-75"
        )}
      >
        {/* [METRIC CODE] */}
        <span className="text-neutral-400 group-hover:text-neutral-200 font-medium tracking-wider">
          [{meta.shortTag}]
        </span>

        {/* PRIMARY TABULAR VALUE */}
        <span
          className={cn(
            "font-semibold tracking-tight",
            flashDir === "up"
              ? "text-emerald-300"
              : flashDir === "down"
              ? "text-rose-300"
              : "text-neutral-100"
          )}
        >
          {formattedVal}
        </span>

        {/* DIRECTIONAL TICK + DELTA (only when backend previous_value is present) */}
        {stat?.current_value != null && stat?.previous_value != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium",
              flashDir === "up"
                ? "text-emerald-300 font-bold"
                : flashDir === "down"
                ? "text-rose-300 font-bold"
                : delta.textClass
            )}
          >
            <span>{delta.icon}</span>
            <span>{delta.shortText}</span>
          </span>
        )}

        {/* (PROVENANCE · PERIOD · CADENCE) */}
        <span className="text-[10px] text-neutral-400 inline-flex items-center gap-1">
          <span>({asOfLabel})</span>
          {meta.isDailyMarket ? (
            <span
              className="inline-block w-1.5 h-1.5 bg-emerald-400"
              title="High-frequency market series (Daily / Monthly)"
            />
          ) : isStale ? (
            <span className="px-1 py-0 text-[9px] uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400/90">
              SOURCE LAG
            </span>
          ) : null}
        </span>
      </button>
    );
  };

  return (
    <div
      role="region"
      aria-label="Nigeria Macroeconomic Operational Wire"
      className="w-full h-8 bg-[#0B0F17] text-neutral-200 border-b border-white/[0.08] flex items-center overflow-hidden select-none z-40 shrink-0"
    >
      {/* Static Terminal Wire Header Prefix */}
      <div className="flex items-center gap-2 px-3 h-full bg-[#111622] border-r border-neutral-800 text-[10px] font-mono uppercase tracking-widest text-neutral-300 shrink-0 z-10">
        <span className="inline-block w-1.5 h-1.5 bg-emerald-500" />
        <span className="font-semibold text-emerald-400">NGA WIRE</span>
        <span className="text-neutral-500">//</span>
        <span className="hidden sm:inline text-neutral-400">VERIFIED SERIES</span>
      </div>

      {/* Scrolling Operational Ribbon */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div className="animate-ticker-scroll items-center h-full">
          <div className="flex items-center h-full">
            {orderedConfigs.map((ind) => renderTickerItem(ind, "strip-a"))}
          </div>
          <div className="flex items-center h-full" aria-hidden="true">
            {orderedConfigs.map((ind) => renderTickerItem(ind, "strip-b"))}
          </div>
        </div>
      </div>
    </div>
  );
}

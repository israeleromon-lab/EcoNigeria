"use client";

import { useState, useEffect } from "react";
import { Shield, Check, X, Settings2, Database, BarChart3, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CookiePreferences {
  necessary: boolean;
  performance: boolean;
  analytics: boolean;
  timestamp: string;
}

const STORAGE_KEY = "econonigeria_cookie_consent";
const COOKIE_NAME = "econonigeria_consent";

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    performance: true,
    analytics: false,
    timestamp: "",
  });

  useEffect(() => {
    // Check if consent has already been granted
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      } else {
        // First visit: show consent banner after brief delay
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback if localStorage is unavailable
      setIsOpen(true);
    }

    // Global listener allowing any link/button to reopen cookie preferences
    const handleOpen = () => {
      setIsOpen(true);
      setIsCustomizing(true);
    };

    window.addEventListener("econonigeria:open-cookie-preferences", handleOpen);
    return () => {
      window.removeEventListener("econonigeria:open-cookie-preferences", handleOpen);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const updated = {
      ...prefs,
      necessary: true, // Always required
      timestamp: new Date().toISOString(),
    };

    setPreferences(updated);
    setIsOpen(false);
    setIsCustomizing(false);

    try {
      // 1. Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // 2. Set 1-year browser cookie
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
        JSON.stringify(updated)
      )}; max-age=${maxAge}; path=/; SameSite=Lax`;

      // 3. Dispatch event for analytics / caching layers
      window.dispatchEvent(
        new CustomEvent("econonigeria:cookie-consent-updated", { detail: updated })
      );
    } catch (e) {
      console.warn("Could not persist cookie consent:", e);
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      performance: true,
      analytics: true,
      timestamp: "",
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      necessary: true,
      performance: false,
      analytics: false,
      timestamp: "",
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-0 left-0 right-0 z-[999] p-3 sm:p-5 pointer-events-none"
    >
      <div className="w-full max-w-[900px] mx-auto bg-background/95 dark:bg-[#0B0F17]/95 border-2 border-border dark:border-white/[0.15] shadow-2xl backdrop-blur-md pointer-events-auto p-4 sm:p-6 transition-all duration-200">
        {/* Terminal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-border dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 animate-pulse" />
            <span
              id="cookie-consent-title"
              className="text-[11px] font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase"
            >
              PRIVACY PROTOCOL // COOKIE &amp; STORAGE PREFERENCES
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close preferences notification"
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm font-serif text-muted-foreground leading-relaxed mb-4">
          EconoNigeria operates on open, transparent principles. We use browser storage to
          preserve your terminal theme, maintain security tokens, and locally cache macroeconomic
          series to minimize bandwidth consumption and latency. We do not use third-party tracking or advertising cookies.
        </p>

        {/* Granular Preferences (Toggled via Customize) */}
        {isCustomizing && (
          <div className="space-y-3 pt-2 pb-4 mb-4 border-t border-border dark:border-white/[0.08]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3 border border-border dark:border-white/[0.08] bg-muted/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Essential</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    REQUIRED
                  </span>
                </div>
                <p className="text-[11px] font-serif text-muted-foreground">
                  Theme selection, terminal HUD state, and rate-limit security. Cannot be disabled.
                </p>
              </div>

              {/* Category 2: Performance & Caching */}
              <div
                onClick={() =>
                  setPreferences((p) => ({ ...p, performance: !p.performance }))
                }
                className={cn(
                  "p-3 border cursor-pointer transition-all",
                  preferences.performance
                    ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                    : "border-border dark:border-white/[0.08] bg-muted/10 opacity-70"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span>Cache</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.performance}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, performance: e.target.checked }))
                    }
                    className="accent-emerald-500 w-3.5 h-3.5"
                  />
                </div>
                <p className="text-[11px] font-serif text-muted-foreground">
                  Caches indicator queries and sparklines in memory to make navigation instant.
                </p>
              </div>

              {/* Category 3: Analytics */}
              <div
                onClick={() =>
                  setPreferences((p) => ({ ...p, analytics: !p.analytics }))
                }
                className={cn(
                  "p-3 border cursor-pointer transition-all",
                  preferences.analytics
                    ? "border-emerald-500/50 bg-emerald-500/[0.04]"
                    : "border-border dark:border-white/[0.08] bg-muted/10 opacity-70"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                    <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Telemetry</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                    }
                    className="accent-emerald-500 w-3.5 h-3.5"
                  />
                </div>
                <p className="text-[11px] font-serif text-muted-foreground">
                  Anonymous usage aggregates to help us prioritize statistical source adapters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsCustomizing((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground self-start transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isCustomizing ? "Hide Options" : "Customize Preferences"}</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-3 py-1.5 border border-border dark:border-white/[0.12] hover:border-foreground text-xs font-mono uppercase tracking-wider transition-colors"
            >
              Essential Only
            </button>

            {isCustomizing ? (
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-1.5 border border-emerald-500/60 bg-emerald-500 text-black dark:text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors"
              >
                Save Preferences
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-1.5 border border-emerald-500/60 bg-emerald-500 text-black dark:text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors"
              >
                Accept All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("econonigeria:open-cookie-preferences"));
  }
}

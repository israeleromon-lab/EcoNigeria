"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAIAnalystReport, saveAIReport } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Sparkles, Save, Check } from "lucide-react";

export function AIAnalystCard() {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ai_analyst"],
    queryFn: fetchAIAnalystReport,
    enabled: false, // Wait for user click to generate
  });

  const handleSave = async () => {
    if (!data?.report) return;

    setIsSaving(true);
    try {
      await saveAIReport({
        title: `Economic Outlook - ${new Date().toLocaleDateString()}`,
        summary: data.report.summary,
        insights: data.report.key_insights || [],
        outlook: data.report.outlook || "Neutral",
        risk_factors: data.report.risk_factors || [],
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save report:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="mb-5 sm:mb-6">
        <div className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 px-2 py-1 border border-border bg-muted/30 text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
          <span>MACHINE-GENERATED MACRO SUMMARY</span>
          <span className="hidden sm:inline">·</span>
          <span>GROUNDED ON VERIFIED NBS / CBN / WB DATA</span>
        </div>
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold uppercase tracking-tight">
          <Sparkles className="w-5 h-5 text-foreground shrink-0" />
          <span>AI Economic Analyst</span>
        </h2>
        <p className="text-muted-foreground font-serif italic mt-1 text-xs sm:text-sm">
          Synthesizes verified database series into executive macro briefs (non-primary citation)
        </p>
      </div>
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-muted/10 border border-border text-xs sm:text-sm font-serif text-muted-foreground mb-4">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-foreground"></span>
              </span>
              <span className="animate-pulse">
                Synthesizing verified NBS, CBN, and World Bank series...
              </span>
            </div>
            <Skeleton className="h-24 w-full rounded-none" />
            <Skeleton className="h-4 w-3/4 rounded-none" />
            <Skeleton className="h-4 w-1/2 rounded-none" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/10 text-destructive border border-destructive flex-1 text-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="font-serif">Failed to generate report.</p>
          </div>
        ) : data?.report ? (
          <div className="space-y-5 sm:space-y-6 flex-1">
            <div className="p-3.5 sm:p-4 bg-muted/10 border-l-4 border-foreground">
              <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 font-serif">
                <span className="font-bold text-foreground block mb-1 uppercase tracking-wider text-xs font-sans">
                  Executive Summary (Machine-Generated)
                </span>
                {data.report.summary}
              </p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 border-b border-border pb-1">
                Key Insights
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground list-square pl-5 space-y-2 font-serif">
                {data.report.key_insights?.map((insight: string, i: number) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto pt-4 border-t border-border pb-2">
              <div className="sm:border-r border-border sm:pr-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Outlook
                </span>
                <p className="font-serif text-base sm:text-lg mt-1">{data.report.outlook}</p>
              </div>
              <div className="sm:pl-4">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Key Risk
                </span>
                <p className="font-serif text-base sm:text-lg text-destructive mt-1">
                  {data.report.risk_factors?.[0]}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 mt-2 rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors"
              onClick={handleSave}
              disabled={isSaving || isSaved}
            >
              {isSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaved
                ? "Saved to Research Hub"
                : isSaving
                ? "Saving..."
                : "Save to Research Hub"}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-5 sm:p-8 border border-border/50 bg-muted/5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border border-foreground flex items-center justify-center mb-4 sm:mb-6">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 font-serif leading-relaxed max-w-md">
              Generates an automated executive synthesis grounded strictly on verified
              NBS, CBN, DMO, FRED, and World Bank series in the EconoNigeria database.
            </p>
            <Button
              onClick={() => refetch()}
              className="w-full gap-2 rounded-none border-foreground bg-foreground text-background hover:bg-background hover:text-foreground hover:border-foreground border-2 transition-all text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Generate Grounded Macro Brief</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

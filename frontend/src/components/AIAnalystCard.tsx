"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAIAnalystReport, saveAIReport } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        risk_factors: data.report.risk_factors || []
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
    <Card className="bg-card/50 border-border/50 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Economic Analyst
        </CardTitle>
        <CardDescription>Generated insights based on latest macroeconomic data</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-4 flex-1">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex-1 text-center">
             <AlertCircle className="w-8 h-8 mb-2" />
             <p>Failed to generate report.</p>
          </div>
        ) : data?.report ? (
          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm leading-relaxed text-foreground/90">
                <span className="font-semibold text-primary block mb-1">Summary:</span> 
                {data.report.summary}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Key Insights:</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {data.report.key_insights?.map((insight: string, i: number) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border mt-4 pb-2">
               <div>
                 <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Outlook</span>
                 <p className="font-medium">{data.report.outlook}</p>
               </div>
               <div>
                 <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Key Risk</span>
                 <p className="font-medium text-destructive">{data.report.risk_factors?.[0]}</p>
               </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full gap-2 mt-2" 
              onClick={handleSave}
              disabled={isSaving || isSaved}
            >
              {isSaved ? <Check className="w-4 h-4 text-green-500" /> : <Save className="w-4 h-4" />}
              {isSaved ? "Saved to Research Hub" : isSaving ? "Saving..." : "Save to Research Hub"}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Our AI Analyst uses Gemini to synthesize the latest data on GDP, Inflation, Population, and Unemployment to provide actionable intelligence.
            </p>
            <Button onClick={() => refetch()} className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Full Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

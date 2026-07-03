"use client";

import { useQuery } from "@tanstack/react-query";
import { getSavedReports } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, AlertCircle } from "lucide-react";

export default function ResearchHub() {
  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ["saved_reports"],
    queryFn: getSavedReports,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Research Hub</h1>
        <p className="text-muted-foreground mt-2">
          Your saved AI Economic Analyst reports and generated insights.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-center">
           <AlertCircle className="w-12 h-12 mb-4" />
           <p className="text-lg font-medium">Failed to load saved reports.</p>
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report: any) => (
            <Card key={report.id} className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {report.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(report.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </CardDescription>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {report.outlook}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm leading-relaxed text-foreground/90">
                      <span className="font-semibold block mb-1">Executive Summary:</span> 
                      {report.summary}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-3 border-b pb-2">Key Insights</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        {report.insights.map((insight: string, i: number) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-3 border-b pb-2 text-destructive">Risk Factors</h4>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-2">
                        {report.risk_factors.map((risk: string, i: number) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-card/30 rounded-xl border border-dashed border-border text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No saved reports yet</h3>
          <p className="text-muted-foreground max-w-md">
            Go to the dashboard and run the AI Economic Analyst to generate and save your first research report.
          </p>
        </div>
      )}
    </div>
  );
}

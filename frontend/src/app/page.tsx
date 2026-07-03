"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatIndicatorValue, formatChange } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import { AIAnalystCard } from "@/components/AIAnalystCard";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nigeria Economic Overview</h1>
        <p className="text-muted-foreground mt-2">
          Latest macroeconomic indicators, historical data, and AI-powered forecasts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          Failed to load dashboard data. Please make sure the backend server is running.
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {INDICATORS.map((indicator) => {
            const stat = data?.indicators?.find((d: any) => d.code === indicator.id);
            
            const pctChange = stat?.pct_change ?? 0;
            const change = formatChange(pctChange);

            return (
              <motion.div key={indicator.id} variants={item}>
                <Link href={`/${indicator.slug}`} className="block group h-full">
                  <Card className="bg-card/50 hover:bg-card/80 transition-all duration-300 border-border/50 hover:border-border hover:-translate-y-1 hover:shadow-lg h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {indicator.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {stat?.current_value != null ? formatIndicatorValue(stat.current_value, indicator.unit) : "N/A"}
                      </div>
                      {stat?.current_value != null && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${change.color} flex items-center gap-0.5`}>
                            {change.icon} {change.text}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            in {stat.current_date}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent group-hover:from-primary/50 transition-colors w-full"></div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
      >
        <AIAnalystCard />

        <Card className="bg-card/50 border-border/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle>Forecasts Overview</CardTitle>
            <CardDescription>Predictive models for upcoming quarters</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4 transition-transform duration-500 hover:rotate-12 hover:scale-110">
                 <BarChart3 className="w-6 h-6 text-muted-foreground" />
               </div>
               <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                 Select an individual indicator to view detailed historical charts and Prophet/ARIMA forecasts.
               </p>
             </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

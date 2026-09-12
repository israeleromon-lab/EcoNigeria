"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/lib/api";
import { INDICATORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
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
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "tween", ease: "easeOut", duration: 0.4 } }
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
      className="space-y-12"
    >
      <div className="border-b-4 border-foreground pb-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">Nigeria Economic Overview</h1>
        <p className="text-xl text-muted-foreground mt-4 font-serif italic">
          Latest macroeconomic indicators, historical data, and AI-powered forecasts.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-muted/10 border border-border text-sm font-serif text-muted-foreground">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-foreground"></span>
            </span>
            <span className="animate-pulse">Waking up the data server... Please allow up to 50 seconds for the initial connection on our free hosting tier.</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 border-l border-t border-border">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-b border-border p-6 bg-background">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="p-6 bg-background text-foreground border border-border">
          Failed to load dashboard data. Please make sure the backend server is running.
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 border-l border-t border-border"
        >
          {INDICATORS.map((indicator) => {
            const stat = data?.indicators?.find((d: any) => d.code === indicator.id);
            
            const pctChange = stat?.pct_change ?? 0;
            const change = formatChange(pctChange);

            return (
              <motion.div key={indicator.id} variants={item}>
                <Link href={`/${indicator.slug}`} className="block group h-full">
                  <div className="bg-background transition-colors duration-300 border-r border-b border-border hover:bg-muted/30 h-full relative overflow-hidden p-6 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        {indicator.name}
                      </h3>
                      <div className="text-3xl font-bold text-foreground font-serif">
                        {stat?.current_value != null ? formatIndicatorValue(stat.current_value, indicator.unit) : "N/A"}
                      </div>
                    </div>
                    {stat?.current_value != null && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                        <span className={`text-xs font-bold ${change.color} flex items-center gap-0.5`}>
                          {change.icon} {change.text}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          in {stat.current_date}
                        </span>
                      </div>
                    )}
                  </div>
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-border"
      >
        <div className="border-b lg:border-b-0 lg:border-r border-border p-6 md:p-8 bg-background">
          <AIAnalystCard />
        </div>

        <div className="p-6 md:p-8 bg-background flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Forecasts Overview</h2>
            <p className="text-muted-foreground font-serif italic">Predictive models for upcoming quarters</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 flex-1 border border-border/50 bg-muted/10">
             <div className="text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-none border border-border bg-background mb-6 transition-transform duration-500 group-hover:scale-105">
                 <BarChart3 className="w-6 h-6 text-foreground" />
               </div>
               <p className="text-sm text-muted-foreground max-w-xs mx-auto font-serif">
                 Select an individual indicator to view detailed historical charts and Prophet/ARIMA forecasts.
               </p>
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

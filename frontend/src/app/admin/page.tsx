"use client";

import { useState } from "react";
import { runETL } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Server, Activity, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{success?: boolean, message?: string} | null>(null);

  const handleRunETL = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const response = await runETL();
      setSyncStatus({ success: true, message: response.message || "ETL pipeline started successfully." });
    } catch (error: any) {
      setSyncStatus({ success: false, message: error.message || "Failed to start ETL pipeline." });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage platform data pipelines and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Database Engine</CardTitle>
            <Database className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SQLite</div>
            <p className="text-xs text-muted-foreground mt-1">Local embedded mode active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Status</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">FastAPI Backend Online</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Indicators</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground mt-1">Macroeconomic series tracked</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Data Pipelines (ETL)
          </CardTitle>
          <CardDescription>
            Manually trigger data synchronization from external sources (World Bank, FRED).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg text-sm mb-4">
            <h4 className="font-semibold mb-2">What happens when you run this?</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Connects to World Bank API and pulls latest data for NGA.</li>
              <li>Connects to FRED API and pulls latest external datasets.</li>
              <li>Cleans, normalizes, and upserts data into the SQLite database.</li>
              <li>Re-trains baseline forecasting models automatically.</li>
            </ul>
          </div>
          
          {syncStatus && (
            <div className={`p-4 rounded-md mb-4 border ${syncStatus.success ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
              <div className="flex items-center gap-2">
                {!syncStatus.success && <ShieldAlert className="w-4 h-4" />}
                <p className="text-sm font-medium">{syncStatus.message}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-card border-t p-6">
          <Button 
            onClick={handleRunETL} 
            disabled={isSyncing}
            className="w-full md:w-auto min-w-[200px]"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Pipeline Running...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run ETL Pipeline Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

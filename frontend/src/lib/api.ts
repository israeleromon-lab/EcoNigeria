import { API_BASE_URL } from "./constants";

export async function fetchDashboardData() {
  const summaryRes = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
    next: { revalidate: 3600 },
  });
  if (summaryRes.ok) {
    return summaryRes.json();
  }
  const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return res.json();
}

export async function fetchDashboardSummary() {
  return fetchDashboardData();
}


export async function fetchIndicatorList() {
  const res = await fetch(`${API_BASE_URL}/api/indicators`, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error("Failed to fetch indicators");
  }
  return res.json();
}

export async function fetchIndicatorData(indicatorCode: string) {
  const res = await fetch(`${API_BASE_URL}/api/indicators/${indicatorCode}/data`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch data for ${indicatorCode}`);
  return res.json();
}

export async function fetchForecastData(
  indicatorCode: string, 
  periods: number = 5,
  model: string = "ensemble",
  shockPct: number = 0
) {
  const url = `${API_BASE_URL}/api/forecasts/${indicatorCode}?periods=${periods}&model=${model}&shock_pct=${shockPct}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch forecast for ${indicatorCode}`);
  return res.json();
}

export async function fetchAIAnalystReport() {
  const res = await fetch(`${API_BASE_URL}/api/analyst/report`, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Failed to fetch AI Analyst report`);
  return res.json();
}

export async function saveAIReport(reportData: any) {
  const res = await fetch(`${API_BASE_URL}/api/research/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  if (!res.ok) throw new Error(`Failed to save AI report`);
  return res.json();
}

export async function getSavedReports() {
  const res = await fetch(`${API_BASE_URL}/api/research`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch saved reports`);
  return res.json();
}

export async function runETL() {
  const res = await fetch(`${API_BASE_URL}/api/admin/run-etl`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to trigger ETL pipeline`);
  return res.json();
}

export async function fetchSystemStatus() {
  const res = await fetch(`${API_BASE_URL}/api/status`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch system status`);
  return res.json();
}

export async function fetchEconomicSignals() {
  const res = await fetch(`${API_BASE_URL}/api/signals`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch economic signals`);
  return res.json();
}

export async function generateCustomBrief(topic: string = "Macro Diagnostic") {
  const res = await fetch(`${API_BASE_URL}/api/analyst/brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) throw new Error("Failed to generate policy brief");
  return res.json();
}

export async function fetchPanAfricanBenchmarks() {
  const res = await fetch(`${API_BASE_URL}/api/compare`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch Pan-African benchmarks");
  return res.json();
}

export async function fetchBilateralComparison(countryA: string, countryB: string) {
  const res = await fetch(`${API_BASE_URL}/api/compare/${countryA}/${countryB}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch comparison for ${countryA} vs ${countryB}`);
  return res.json();
}




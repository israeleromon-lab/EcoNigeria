import { API_BASE_URL } from "./constants";

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE_URL}/api/dashboard`, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return res.json();
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

export async function fetchForecastData(indicatorCode: string, periods: number = 5) {
  const res = await fetch(`${API_BASE_URL}/api/forecasts/${indicatorCode}?periods=${periods}`, { next: { revalidate: 86400 } });
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

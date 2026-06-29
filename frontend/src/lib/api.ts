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
  const res = await fetch(`${API_BASE_URL}/api/indicators/${indicatorCode}`, { next: { revalidate: 3600 } });
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

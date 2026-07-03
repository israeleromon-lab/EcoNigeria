export const INDICATORS = [
  { id: "SP.POP.TOTL", slug: "population", name: "Total Population", unit: "People", color: "#3b82f6" },
  { id: "NY.GDP.PCAP.CD", slug: "gdp-per-capita", name: "GDP per Capita", unit: "USD", color: "#0ea5e9" },
  { id: "FP.CPI.TOTL.ZG", slug: "inflation", name: "Inflation Rate", unit: "%", color: "#f43f5e" },
  { id: "NY.GDP.MKTP.KD.ZG", slug: "gdp-growth", name: "GDP Growth Rate", unit: "%", color: "#10b981" },
  { id: "SL.UEM.TOTL.ZS", slug: "unemployment", name: "Unemployment Rate", unit: "%", color: "#f59e0b" },
  { id: "GC.DOD.TOTL.GD.ZS", slug: "debt-to-gdp", name: "Government Debt", unit: "%", color: "#8b5cf6" },
  { id: "BX.KLT.DINV.CD.WD", slug: "fdi", name: "Foreign Direct Investment", unit: "USD", color: "#14b8a6" },
  { id: "DCOILBRENTEU", slug: "brent-oil", name: "Brent Oil Price", unit: "USD/barrel", color: "#f97316" },
  { id: "FEDFUNDS", slug: "fed-funds", name: "Federal Funds Rate", unit: "%", color: "#eab308" },
  { id: "NGN_USD", slug: "exchange-rate", name: "Exchange Rate (NGN/USD)", unit: "NGN", color: "#6366f1" },
  { id: "SI.POV.NAHC", slug: "poverty-rate", name: "Poverty Rate", unit: "%", color: "#ef4444" },
  { id: "NG.SEC.INCIDENTS", slug: "insecurity", name: "Level of Insecurity", unit: "Incidents", color: "#dc2626" }
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

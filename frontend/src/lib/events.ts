export type EventCategory = 
  | "Structural Reform" 
  | "Monetary Policy" 
  | "Commodity Shock" 
  | "Fiscal Policy" 
  | "External Shock";

export interface MacroEvent {
  id: string;
  year: string;
  date: string;
  title: string;
  shortTitle: string;
  category: EventCategory;
  color: string;
  description: string;
  indicators: string[]; // List of related indicator slugs (e.g. 'inflation', 'exchange-rate')
}

export const MACRO_EVENTS: MacroEvent[] = [
  {
    id: "rate-hikes-2024",
    year: "2024",
    date: "Feb – Jul 2024",
    title: "Aggressive Monetary Tightening Cycle",
    shortTitle: "Historic MPR Hikes",
    category: "Monetary Policy",
    color: "#eab308", // Amber
    description: "The Central Bank of Nigeria instituted record interest rate hikes, pushing the Monetary Policy Rate (MPR) from 18.75% to 26.75% in an aggressive bid to defend the Naira and anchor runaway inflation.",
    indicators: ["inflation", "exchange-rate", "fed-funds", "gdp-growth"]
  },
  {
    id: "subsidy-fx-float-2023",
    year: "2023",
    date: "May – Jun 2023",
    title: "Fuel Subsidy Removal & Naira Float",
    shortTitle: "Subsidy & FX Float",
    category: "Structural Reform",
    color: "#f43f5e", // Rose
    description: "President Bola Tinubu announced the immediate termination of the multi-decade petrol subsidy in May 2023, followed by the unification and floating of the official exchange rate in June 2023. This triggered severe short-term consumer price spikes, transport inflation, and rapid currency adjustment.",
    indicators: ["inflation", "exchange-rate", "poverty-rate", "debt-to-gdp", "gdp-per-capita", "gdp-growth"]
  },
  {
    id: "naira-redesign-2022",
    year: "2022",
    date: "Oct 2022 – Feb 2023",
    title: "Currency Redesign & Cash Crunch",
    shortTitle: "Naira Redesign",
    category: "Monetary Policy",
    color: "#6366f1", // Indigo
    description: "The CBN announced the redesign of 200, 500, and 1,000 Naira banknotes with a strict demonetization deadline, precipitating severe liquidity shortages across the informal economy and temporarily depressing quarterly trade.",
    indicators: ["inflation", "gdp-growth", "unemployment"]
  },
  {
    id: "covid-oil-shock-2020",
    year: "2020",
    date: "Mar – Nov 2020",
    title: "COVID-19 Lockdown & Global Crude Crash",
    shortTitle: "COVID & Oil Crash",
    category: "External Shock",
    color: "#ef4444", // Red
    description: "Global lockdowns caused worldwide oil demand destruction with Brent crude briefly plunging below $20/barrel. Compounded by domestic lockdowns and closed borders, Nigeria's economy contracted by -1.8%, entering its second recession in five years.",
    indicators: ["gdp-growth", "brent-oil", "exchange-rate", "unemployment", "poverty-rate", "debt-to-gdp", "fdi"]
  },
  {
    id: "recession-deval-2016",
    year: "2016",
    date: "Jun 2016",
    title: "Naira Devaluation & 2016 Recession",
    shortTitle: "2016 Stagflation Recession",
    category: "Commodity Shock",
    color: "#f97316", // Orange
    description: "Crippled by militant attacks on Niger Delta oil pipelines and depressed crude receipts, Nigeria abandoned its rigid 197 NGN/USD peg. Headline inflation surged past 18% as the nation entered its first full-year recession in 25 years (-1.6% GDP contraction).",
    indicators: ["gdp-growth", "inflation", "exchange-rate", "brent-oil", "unemployment"]
  },
  {
    id: "oil-price-crash-2014",
    year: "2014",
    date: "Jul – Dec 2014",
    title: "Global Crude Oil Market Collapse",
    shortTitle: "Oil Price Collapse",
    category: "Commodity Shock",
    color: "#f97316", // Orange
    description: "Brent crude plummeted from $115 to under $50 per barrel as US shale oil flooded global markets. Nigeria's Excess Crude Account was depleted, wiping out fiscal buffers and setting the stage for balance-of-payments distress.",
    indicators: ["brent-oil", "exchange-rate", "debt-to-gdp", "gdp-growth", "fdi"]
  },
  {
    id: "occupy-nigeria-2012",
    year: "2012",
    date: "Jan 2012",
    title: "Occupy Nigeria Subsidy Protests",
    shortTitle: "2012 Subsidy Protests",
    category: "Fiscal Policy",
    color: "#8b5cf6", // Purple
    description: "An overnight abolition of petrol subsidies by the federal government sparked nationwide strikes and civil protests under the 'Occupy Nigeria' movement, forcing a partial reinstatement of fuel subsidies.",
    indicators: ["inflation", "gdp-growth", "insecurity"]
  },
  {
    id: "global-financial-crisis-2008",
    year: "2008",
    date: "Sep 2008",
    title: "Global Financial Crisis & Banking Bailout",
    shortTitle: "Global Financial Crisis",
    category: "External Shock",
    color: "#3b82f6", // Blue
    description: "The global credit freeze hammered oil exports and foreign portfolio investment. Margin loans linked to stock speculation triggered a banking crisis, prompting Sanusi Lamido Sanusi's CBN to inject 620 billion Naira into distressed lenders.",
    indicators: ["gdp-growth", "brent-oil", "debt-to-gdp", "fdi", "fed-funds"]
  },
  {
    id: "paris-club-debt-2005",
    year: "2005",
    date: "Oct 2005",
    title: "Historic Paris Club Debt Relief Deal",
    shortTitle: "Paris Club Debt Write-off",
    category: "Fiscal Policy",
    color: "#10b981", // Emerald
    description: "Nigeria finalized an unprecedented $18 billion debt write-off with Paris Club creditors led by Finance Minister Ngozi Okonjo-Iweala. The country paid $12.4 billion to fully extinguish $30 billion of external liabilities, dropping government debt-to-GDP to record lows.",
    indicators: ["debt-to-gdp", "fdi", "gdp-per-capita", "gdp-growth"]
  }
];

export function getEventsForIndicator(indicatorSlug: string): MacroEvent[] {
  return MACRO_EVENTS.filter(e => e.indicators.includes(indicatorSlug));
}

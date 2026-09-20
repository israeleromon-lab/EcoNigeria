export interface IndicatorConfig {
  id: string;
  slug: string;
  name: string;
  unit: string;
  color: string;
  methodology: string;
}

export const INDICATORS: IndicatorConfig[] = [
  {
    id: "SP.POP.TOTL",
    slug: "population",
    name: "Total Population",
    unit: "People",
    color: "#3b82f6",
    methodology: "Total population count for Nigeria. Source: World Bank annual aggregate of UN Population Division estimates. The World Bank figure is typically published with a 1-year lag. For the latest mid-year estimate, refer to the UN World Population Prospects."
  },
  {
    id: "NY.GDP.PCAP.CD",
    slug: "gdp-per-capita",
    name: "GDP per Capita",
    unit: "USD",
    color: "#0ea5e9",
    methodology: "GDP per capita in current US dollars. Source: World Bank national accounts data. This uses the Atlas method for currency conversion. Values may differ from IMF or NBS figures due to different base years, deflators, or exchange rate methodologies."
  },
  {
    id: "FP.CPI.TOTL.ZG",
    slug: "inflation",
    name: "Inflation Rate",
    unit: "%",
    color: "#f43f5e",
    methodology: "Consumer price inflation, annual percentage. Source: World Bank annual aggregate of NBS CPI data. This is the year-over-year annual average, not the month-on-month figure. The latest NBS monthly CPI release may show a different (more recent) rate. Refer to nigerianstat.gov.ng for the current monthly figure."
  },
  {
    id: "NY.GDP.MKTP.KD.ZG",
    slug: "gdp-growth",
    name: "GDP Growth Rate",
    unit: "%",
    color: "#10b981",
    methodology: "Annual GDP growth rate (constant prices). Source: World Bank national accounts. The NBS publishes quarterly GDP estimates which may show different growth patterns. World Bank figures are typically 1-2 years behind the latest NBS quarterly release."
  },
  {
    id: "SL.UEM.TOTL.ZS",
    slug: "unemployment",
    name: "Unemployment Rate",
    unit: "%",
    color: "#f59e0b",
    methodology: "Unemployment as a percentage of total labor force (ILO modeled estimate). Source: World Bank / ILO. Nigeria's NBS uses a different methodology that often produces higher figures. The ILO estimate uses international comparability standards, while NBS uses a 20-hour threshold. Both are valid but measure different things."
  },
  {
    id: "GC.DOD.TOTL.GD.ZS",
    slug: "debt-to-gdp",
    name: "Government Debt",
    unit: "%",
    color: "#8b5cf6",
    methodology: "Central government debt as a percentage of GDP. Source: World Bank / IMF. This covers federal government debt only and may exclude sub-national (state) debt. The Debt Management Office (DMO) publishes more granular and current Nigerian debt figures."
  },
  {
    id: "BX.KLT.DINV.CD.WD",
    slug: "fdi",
    name: "Foreign Direct Investment",
    unit: "USD",
    color: "#14b8a6",
    methodology: "Foreign direct investment, net inflows (BoP, current US$). Source: World Bank / IMF Balance of Payments. This measures equity capital, reinvestment of earnings, and intra-company loans. It differs from CBN 'Capital Importation' data which uses a broader definition including portfolio investment."
  },
  {
    id: "DCOILBRENTEU",
    slug: "brent-oil",
    name: "Brent Oil Price",
    unit: "USD/barrel",
    color: "#f97316",
    methodology: "Europe Brent Spot Price FOB (Dollars per Barrel). Source: U.S. Energy Information Administration via FRED. Daily prices are aggregated into annual averages. Real-time spot prices may differ from the annual average shown here."
  },
  {
    id: "FEDFUNDS",
    slug: "fed-funds",
    name: "Federal Funds Rate",
    unit: "%",
    color: "#eab308",
    methodology: "Effective Federal Funds Rate. Source: Board of Governors of the Federal Reserve System via FRED. Monthly observations aggregated to annual average. The current target rate set by the FOMC may differ from the annual average displayed."
  },
  {
    id: "NGN_USD",
    slug: "exchange-rate",
    name: "Exchange Rate (NGN/USD)",
    unit: "NGN",
    color: "#6366f1",
    methodology: "Nigerian Naira to US Dollar exchange rate. Source: exchangerate-api.com. This reflects the official/interbank market rate. The parallel (black market) rate in Nigeria can differ significantly. CBN publishes the official rate at cbn.gov.ng."
  },
  {
    id: "SI.POV.NAHC",
    slug: "poverty-rate",
    name: "Poverty Rate",
    unit: "%",
    color: "#ef4444",
    methodology: "National poverty headcount ratio (% of population below the national poverty line). Source: World Bank. Poverty surveys in Nigeria are infrequent (last major survey: 2018/19 NLSS). This figure may be several years old. The World Bank Poverty & Equity portal has the most recent estimates."
  },
  {
    id: "NG.SEC.INCIDENTS",
    slug: "insecurity",
    name: "Level of Insecurity",
    unit: "Incidents",
    color: "#dc2626",
    methodology: "Annual recorded security incidents and armed conflict events. Source: ACLED (Armed Conflict Location & Event Data Project) via proxy dataset. This is an estimate based on media reports and field research. Actual incident counts may be higher due to underreporting in remote areas."
  }
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

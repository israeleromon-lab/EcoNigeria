export interface IndicatorConfig {
  id: string;
  slug: string;
  name: string;
  unit: string;
  color: string;
  methodology: string;
  publisher: string;
  publicationName: string;
  sourceUrl: string;
  nativeFrequency: string;
  releaseCadence: string;
  nextRelease: string;
  baseYear: string;
  structuralBreakNote?: string;
  baselineValue: number;
  baselinePeriod: string;
}

export const INDICATORS: IndicatorConfig[] = [
  {
    id: "SP.POP.TOTL",
    slug: "population",
    name: "Total Population",
    unit: "People",
    color: "#3b82f6",
    publisher: "World Bank / NPC",
    publicationName: "UN World Population Prospects & World Bank WDI (SP.POP.TOTL)",
    sourceUrl: "https://data.worldbank.org/indicator/SP.POP.TOTL?locations=NG",
    nativeFrequency: "Annual",
    releaseCadence: "Annual (July WDI Revision)",
    nextRelease: "July 2026 (Annual WDI Update)",
    baseYear: "De facto mid-year population count",
    structuralBreakNote:
      "Nigeria's last official national housing and population census was conducted in 2006. Post-2006 figures represent demographic cohort-component projections modeled by the UN Population Division and National Population Commission (NPC).",
    baselineValue: 227882945,
    baselinePeriod: "2023",
    methodology:
      "Total de facto mid-year population count for Nigeria. Source: World Bank annual aggregate of UN Population Division and National Population Commission (NPC) demographic estimates. Published annually with a 1-year revision cycle."
  },
  {
    id: "NY.GDP.PCAP.CD",
    slug: "gdp-per-capita",
    name: "GDP per Capita",
    unit: "USD",
    color: "#0ea5e9",
    publisher: "World Bank / NBS",
    publicationName: "World Bank National Accounts & NBS Nominal GDP Series (NY.GDP.PCAP.CD)",
    sourceUrl: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=NG",
    nativeFrequency: "Annual",
    releaseCadence: "Annual (WDI National Accounts)",
    nextRelease: "Q2 2026 (Annual National Accounts)",
    baseYear: "Current US Dollars (Official Exchange Rate Conversion)",
    structuralBreakNote:
      "2023–2024 FX Translation Shift: Because USD GDP per capita converts nominal Naira GDP using official NAFEM/CBN exchange rates, the June 2023 Naira harmonization caused a sharp drop in USD-denominated GDP per capita despite positive real Naira GDP growth.",
    baselineValue: 1596.6,
    baselinePeriod: "2023",
    methodology:
      "Gross Domestic Product divided by midyear population in current US dollars. Source: World Bank National Accounts data and NBS National Accounts. Values reflect official exchange rate conversions and may differ from PPP-adjusted or rebased NBS domestic series."
  },
  {
    id: "FP.CPI.TOTL.ZG",
    slug: "inflation",
    name: "Inflation Rate",
    unit: "%",
    color: "#f43f5e",
    publisher: "NBS / World Bank",
    publicationName: "NBS Monthly CPI Statistical Report & World Bank WDI (FP.CPI.TOTL.ZG)",
    sourceUrl: "https://www.nigerianstat.gov.ng",
    nativeFrequency: "Monthly (NBS) / Annual (WB)",
    releaseCadence: "15th of each month (NBS) / Annual WDI",
    nextRelease: "15th of next month (NBS CPI Calendar)",
    baseYear: "November 2009 = 100 (NBS Composite CPI Base)",
    structuralBreakNote:
      "Methodological Distinction: The historical multi-decade series tracks the annual average Consumer Price Index (YoY %), whereas headline NBS monthly press releases report point-in-time 12-month YoY changes. NBS is also undertaking a CPI weight and base-year rebasing exercise.",
    baselineValue: 33.2,
    baselinePeriod: "2024",
    methodology:
      "Consumer price inflation, annual percentage change in composite urban and rural basket. Source: National Bureau of Statistics (NBS) CPI reports and World Bank WDI historical series. Note that annual average CPI differs mathematically from single-month point-in-time YoY CPI."
  },
  {
    id: "NY.GDP.MKTP.KD.ZG",
    slug: "gdp-growth",
    name: "GDP Growth Rate",
    unit: "%",
    color: "#10b981",
    publisher: "NBS / World Bank",
    publicationName: "NBS Nigerian Gross Domestic Product Report & World Bank WDI (NY.GDP.MKTP.KD.ZG)",
    sourceUrl: "https://www.nigerianstat.gov.ng",
    nativeFrequency: "Quarterly (NBS) / Annual",
    releaseCadence: "Quarterly (~45 days post-quarter) & Annual",
    nextRelease: "Quarterly NBS National Accounts Release",
    baseYear: "2010 Constant Basic Prices (Rebased from 1990 in 2014)",
    structuralBreakNote:
      "2014 GDP Rebasing Break: Nigeria rebased its National Accounts base year from 1990 to 2010 constant prices in April 2014, incorporating telecommunications, Nollywood, and e-commerce. A new NBS GDP rebasing (to 2019 base year) is currently in progress.",
    baselineValue: 3.19,
    baselinePeriod: "2024",
    methodology:
      "Annual percentage growth rate of GDP at market prices based on constant 2010 local currency. Source: National Bureau of Statistics (NBS) Quarterly/Annual National Accounts and World Bank National Accounts data."
  },
  {
    id: "SL.UEM.TOTL.ZS",
    slug: "unemployment",
    name: "Unemployment Rate",
    unit: "%",
    color: "#f59e0b",
    publisher: "NBS / ILO",
    publicationName: "NBS Nigeria Labour Force Survey (NLFS) & ILOSTAT Modelled Estimates (SL.UEM.TOTL.ZS)",
    sourceUrl: "https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=NG",
    nativeFrequency: "Quarterly (NLFS) / Annual (ILO)",
    releaseCadence: "Quarterly (NBS NLFS) / Annual (ILO Harmonized)",
    nextRelease: "Quarterly NBS NLFS Publication",
    baseYear: "ILO 19th ICLS Standard (1+ Hour/Week Criterion)",
    structuralBreakNote:
      "2023 NBS NLFS Structural Break: In Q1 2023, NBS retired its legacy definition (which classified anyone working <20 hours/week as unemployed, producing 33.3% in Q4 2020) and adopted the ILO 19th ICLS standard (classifying ≥1 hour/week for pay/profit as employed, producing ~4.1%–5.3% in 2023–2024). This series uses the harmonized ILO 1-hour definition across all years to prevent artificial discontinuity.",
    baselineValue: 3.07,
    baselinePeriod: "2023",
    methodology:
      "Unemployment as a percentage of total labor force using the harmonized ILO 19th ICLS definition (≥1 hour/week employment threshold). Prior to 2023, NBS domestic reports used a 20-hour/week threshold (recording 33.3% in Q4 2020) before aligning with the ILO definition in the 2023 Nigeria Labour Force Survey (NLFS)."
  },
  {
    id: "GC.DOD.TOTL.GD.ZS",
    slug: "debt-to-gdp",
    name: "Government Debt",
    unit: "%",
    color: "#8b5cf6",
    publisher: "DMO / World Bank",
    publicationName: "Debt Management Office (DMO) Public Debt Bulletin & IMF/WB WDI (GC.DOD.TOTL.GD.ZS)",
    sourceUrl: "https://www.dmo.gov.ng/debt-profile/total-public-debt",
    nativeFrequency: "Quarterly (DMO) / Annual",
    releaseCadence: "Quarterly (~60 days post-quarter)",
    nextRelease: "Quarterly DMO Debt Stock Release",
    baseYear: "Total Public Debt Stock as % of Nominal GDP",
    structuralBreakNote:
      "2023 Ways & Means Securitization + FX Revaluation: In May 2023, N22.7 trillion in CBN Ways & Means advances were securitized into FGN domestic debt, alongside NAFEM exchange rate revaluation of external USD debt.",
    baselineValue: 46.8,
    baselinePeriod: "2023",
    methodology:
      "Central and general government gross debt as a percentage of nominal GDP. Source: Debt Management Office (DMO) Nigeria and World Bank/IMF Fiscal Monitor. Covers domestic and external debt stock converted at official end-period exchange rates."
  },
  {
    id: "BX.KLT.DINV.CD.WD",
    slug: "fdi",
    name: "Foreign Direct Investment",
    unit: "USD",
    color: "#14b8a6",
    publisher: "CBN / World Bank",
    publicationName: "CBN Balance of Payments Statistics & World Bank WDI (BX.KLT.DINV.CD.WD)",
    sourceUrl: "https://data.worldbank.org/indicator/BX.KLT.DINV.CD.WD?locations=NG",
    nativeFrequency: "Annual (BoP) / Quarterly",
    releaseCadence: "Quarterly CBN BoP & Annual IMF/WB",
    nextRelease: "Quarterly CBN Balance of Payments Brief",
    baseYear: "Current US Dollars (BPM6 Standard)",
    structuralBreakNote:
      "Definition Note: Measures net Balance of Payments FDI inflows (equity + reinvested earnings + intercompany debt, net of divestments) under IMF BPM6, which is distinct from NBS 'Capital Importation' reports that measure gross foreign portfolio and loan inflows.",
    baselineValue: 1872500000,
    baselinePeriod: "2023",
    methodology:
      "Foreign direct investment, net inflows (Balance of Payments, current US$ under IMF BPM6). Source: Central Bank of Nigeria (CBN) Balance of Payments compilation and World Bank WDI. Reflects net equity and reinvested earnings."
  },
  {
    id: "DCOILBRENTEU",
    slug: "brent-oil",
    name: "Brent Oil Price",
    unit: "USD/barrel",
    color: "#f97316",
    publisher: "EIA / FRED",
    publicationName: "U.S. Energy Information Administration via St. Louis FED (DCOILBRENTEU)",
    sourceUrl: "https://fred.stlouisfed.org/series/DCOILBRENTEU",
    nativeFrequency: "Daily Spot (Annualized in Long-Run Chart)",
    releaseCadence: "Daily Spot / Annualized Historical Series",
    nextRelease: "Daily (Business Days via EIA/FRED)",
    baseYear: "FOB Europe Spot Dollars per Barrel",
    structuralBreakNote:
      "Aggregation Note: While daily spot observations are ingested from EIA/FRED for current market monitoring, multi-decade historical chart series represent calendar-year arithmetic averages of daily FOB Europe Brent closes.",
    baselineValue: 80.56,
    baselinePeriod: "2024",
    methodology:
      "Europe Brent Spot Price FOB (Dollars per Barrel). Source: U.S. Energy Information Administration (EIA) via Federal Reserve Economic Data (FRED). Historical multi-year charts aggregate daily spot closes into annual averages; Nigeria's Bonny Light benchmark typically trades at a slight premium to Brent."
  },
  {
    id: "FEDFUNDS",
    slug: "fed-funds",
    name: "Federal Funds Rate",
    unit: "%",
    color: "#eab308",
    publisher: "Federal Reserve / FRED",
    publicationName: "Board of Governors of the Federal Reserve System H.15 Release (FEDFUNDS)",
    sourceUrl: "https://fred.stlouisfed.org/series/FEDFUNDS",
    nativeFrequency: "Monthly (EFFR) / Annualized Series",
    releaseCadence: "Monthly (1st Business Day of Month)",
    nextRelease: "Monthly H.15 / FOMC Schedule",
    baseYear: "Volume-Weighted Median Effective Rate (%)",
    baselineValue: 5.14,
    baselinePeriod: "2024",
    methodology:
      "Effective Federal Funds Rate (EFFR). Source: Board of Governors of the Federal Reserve System via FRED. Serves as the global USD liquidity and emerging-market Eurobond yield benchmark impacting Nigeria's external borrowing costs."
  },
  {
    id: "NGN_USD",
    slug: "exchange-rate",
    name: "Exchange Rate (NGN/USD)",
    unit: "NGN",
    color: "#6366f1",
    publisher: "CBN / FMDQ",
    publicationName: "CBN Official NAFEM / I&E Window Closing Rate & Open Exchange API (NGN_USD)",
    sourceUrl: "https://www.cbn.gov.ng/rates/ExchRateByCurrency.asp",
    nativeFrequency: "Daily (Official Window)",
    releaseCadence: "Daily (Business Days — NAFEM Closing)",
    nextRelease: "Daily Market Close (16:30 WAT)",
    baseYear: "Official NAFEM Spot Window (NGN per 1 USD)",
    structuralBreakNote:
      "June 2023 FX Unification Break: On June 14, 2023, the Central Bank of Nigeria abolished multiple segmented exchange rate windows and floated the Naira on the Nigerian Autonomous Foreign Exchange Market (NAFEM), causing a structural step-change from ~461 NGN/USD to market-clearing levels.",
    baselineValue: 1545.0,
    baselinePeriod: "2024",
    methodology:
      "Official Nigerian Naira per US Dollar exchange rate (NAFEM / CBN official window). Source: Central Bank of Nigeria (CBN), FMDQ Exchange, and ExchangeRate-API for live spot tracking. Reflects official wholesale market settlement, which may differ from informal parallel market quotes."
  },
  {
    id: "SI.POV.NAHC",
    slug: "poverty-rate",
    name: "Poverty Rate",
    unit: "%",
    color: "#ef4444",
    publisher: "NBS / World Bank",
    publicationName: "NBS National Living Standards Survey (NLSS 2018/19) & WB Macro Poverty Outlook (SI.POV.NAHC)",
    sourceUrl: "https://data.worldbank.org/indicator/SI.POV.NAHC?locations=NG",
    nativeFrequency: "Multi-Year Survey / Annual MPO",
    releaseCadence: "Periodic Household Survey + Annual WB MPO Estimate",
    nextRelease: "Next NBS NLSS / World Bank MPO Cycle",
    baseYear: "2018/19 NLSS National Poverty Line (N137,430/year)",
    structuralBreakNote:
      "Survey Cadence & Estimation Disclosure: Official national household poverty surveys (NBS NLSS) occur periodically (most recently 2018/19 at 40.1%, excluding Borno state). Subsequent observations (2020–2024) are micro-simulation estimates published in the World Bank Nigeria Development Update (NDU) and Macro Poverty Outlook (MPO).",
    baselineValue: 40.1,
    baselinePeriod: "2023",
    methodology:
      "National poverty headcount ratio (% of population living below the national poverty line). Primary survey baseline: NBS 2018/19 Nigerian Living Standards Survey (NLSS, 40.1%). Post-survey years incorporate World Bank Poverty & Equity / Macro Poverty Outlook (MPO) micro-simulated updates."
  },
  {
    id: "FI.RES.TOTL.CD",
    slug: "external-reserves",
    name: "Gross External Reserves",
    unit: "USD",
    color: "#059669",
    publisher: "CBN / World Bank",
    publicationName: "CBN Movement in Foreign Reserves & IMF/WB International Liquidity (FI.RES.TOTL.CD)",
    sourceUrl: "https://www.cbn.gov.ng/IntOps/Reserve.asp",
    nativeFrequency: "Monthly (CBN 30-Day Moving Avg)",
    releaseCadence: "Daily/Monthly (CBN Statistical Release)",
    nextRelease: "Monthly CBN Reserves Update",
    baseYear: "Current US Dollars (30-Day Moving Average)",
    structuralBreakNote:
      "Valuation Note: CBN reports headline external reserves on a 30-day moving average basis comprising convertible foreign currencies, IMF Special Drawing Rights (SDRs), and monetary gold. Gross figures do not net out short-term FX swaps or forward encumbrances.",
    baselineValue: 38450000000,
    baselinePeriod: "2024",
    methodology:
      "Total gross official foreign exchange reserves including monetary gold, SDR holdings, and IMF reserve position held by the Central Bank of Nigeria (CBN). Source: CBN Statistical Bulletin / Reserves Portal (cbn.gov.ng) and World Bank International Reserves statistics."
  }
];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

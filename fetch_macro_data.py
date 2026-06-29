import os
import requests
import pandas as pd
import matplotlib.pyplot as plt
import urllib3

# Suppress insecure request warnings due to local certificate issues
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

INDICATORS = {
    "population": "SP.POP.TOTL",
    "gdp_per_capita": "NY.GDP.PCAP.CD",
    "inflation": "FP.CPI.TOTL.ZG",
    "gdp_growth": "NY.GDP.MKTP.KD.ZG",
    "unemployment": "SL.UEM.TOTL.ZS",
    "government_debt": "GC.DOD.TOTL.GD.ZS"
}

BASE_URL = "https://api.worldbank.org/v2"
COUNTRY_CODE = "NGA"

def fetch_indicator(name, indicator_code):
    url = f"{BASE_URL}/country/{COUNTRY_CODE}/indicator/{indicator_code}"
    params = {
        "format": "json",
        "per_page": 1000
    }
    
    print(f"\n{'='*40}")
    print(f"Fetching {name} ({indicator_code})...")
    
    try:
        response = requests.get(url, params=params, verify=False)
        response.raise_for_status()
        data = response.json()
        
        if len(data) < 2 or not data[1]:
            print(f"No data returned for {name}.")
            return None
            
        # Parse into pandas DataFrame
        df = pd.DataFrame(data[1])
        
        # We only care about date and value
        df = df[['date', 'value']].copy()
        
        # Rename value column to the indicator name
        df.rename(columns={'value': name}, inplace=True)
        
        # Convert date to int for sorting
        df['date'] = df['date'].astype(int)
        
        # Sort chronologically (oldest to newest)
        df = df.sort_values('date').reset_index(drop=True)
        
        # Drop rows where value is NaN
        df = df.dropna(subset=[name])
        
        if df.empty:
            print(f"All values were null for {name}.")
            return None
            
        return df
    except Exception as e:
        print(f"Error fetching {name}: {e}")
        return None

def main():
    os.makedirs('datasets', exist_ok=True)
    os.makedirs('charts', exist_ok=True)
    
    combined_df = None
    
    for name, code in INDICATORS.items():
        df = fetch_indicator(name, code)
        
        if df is not None:
            # Save individual CSV
            csv_path = f"datasets/{name}.csv"
            df.to_csv(csv_path, index=False)
            print(f"-> Saved {name} data to {csv_path}")
            
            # Display stats
            latest_row = df.iloc[-1]
            latest_year = latest_row['date']
            latest_value = latest_row[name]
            
            print(f"-> Latest Year:  {int(latest_year)}")
            print(f"-> Latest Value: {latest_value}")
            
            print("\n-> First 10 rows:")
            print(df.head(10).to_string(index=False))
            
            print("\n-> Summary Statistics:")
            print(df[name].describe())
            
            # Generate Line Chart
            plt.figure(figsize=(10, 6))
            plt.plot(df['date'], df[name], marker='o', linestyle='-', color='b')
            plt.title(f"{name.replace('_', ' ').title()} Over Time - Nigeria")
            plt.xlabel("Year")
            plt.ylabel(name.replace('_', ' ').title())
            plt.grid(True, alpha=0.3)
            plt.tight_layout()
            
            chart_path = f"charts/{name}_chart.png"
            plt.savefig(chart_path)
            plt.close()
            print(f"-> Chart saved to {chart_path}")
            
            # Merge for combined DataFrame
            if combined_df is None:
                combined_df = df
            else:
                combined_df = pd.merge(combined_df, df, on='date', how='outer')

    if combined_df is not None:
        # Sort combined_df chronologically
        combined_df = combined_df.sort_values('date').reset_index(drop=True)
        
        # Rename columns to match requirements
        combined_df.rename(columns={'date': 'Date'}, inplace=True)
        cols = {col: col.replace('_', ' ').title() for col in combined_df.columns if col != 'Date'}
        
        # Specifically rename certain columns to match the prompt exactly
        if 'population' in combined_df.columns:
            cols['population'] = 'Population'
        if 'gdp_per_capita' in combined_df.columns:
            cols['gdp_per_capita'] = 'GDP_Per_Capita'
            
        combined_df.rename(columns=cols, inplace=True)
        
        # Save combined dataset
        combined_csv_path = "datasets/nigeria_macro_data.csv"
        combined_df.to_csv(combined_csv_path, index=False)
        print(f"\n{'='*40}")
        print(f"Combined dataset saved to: {combined_csv_path}")
        print("\nCombined Data Preview (Last 5 rows):")
        print(combined_df.tail().to_string(index=False))

if __name__ == "__main__":
    main()

import requests

def fetch_world_bank_data(country_code, indicator, name):
    url = f"http://api.worldbank.org/v2/country/{country_code}/indicator/{indicator}"
    params = {
        "format": "json"
    }
    
    try:
        response = requests.get(url, params=params, verify=False)
        response.raise_for_status()
        data = response.json()
        
        if len(data) == 2 and len(data[1]) > 0:
            for record in data[1]:
                value = record.get('value')
                if value is not None:
                    year = record.get('date')
                    print(f"{name} ({year}): {value}")
                    return
            print(f"Could not find non-null {name} data.")
        else:
            print(f"Could not retrieve {name} data.")
    except Exception as e:
        print(f"Error fetching {name}: {e}")

if __name__ == "__main__":
    print("Fetching data for Nigeria...")
    fetch_world_bank_data("ng", "SP.POP.TOTL", "Total Population")
    fetch_world_bank_data("ng", "NY.GDP.PCAP.CD", "GDP per capita (current US$)")

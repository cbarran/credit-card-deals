import json
import requests
from bs4 import BeautifulSoup

def scrape_travel_deals():
    # URL targeting travel credit card deals
    url = "https://thepointsguy.com/credit-cards/travel/" 
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        deals = []
        # Finding deal cards
        # Note: These selectors are placeholders. Real-world scraping requires 
        # precise matching of the website's HTML structure.
        cards = soup.select('.card-module') 
        
        for card in cards:
            name = card.select_one('.card-title')
            bonus = card.select_one('.bonus-amount')
            
            if name and bonus:
                deal = {
                    "name": name.text.strip(),
                    "bonus": bonus.text.strip(),
                    "spend": "Check site for details", # Placeholder
                    "fee": "Check site for details",   # Placeholder
                    "link": url # Placeholder
                }
                deals.append(deal)
        
        with open('data/deals.json', 'w') as f:
            json.dump(deals, f, indent=2)
            
    except Exception as e:
        print(f"Scraping error: {e}")

if __name__ == "__main__":
    scrape_travel_deals()
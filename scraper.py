import json
import requests
from bs4 import BeautifulSoup
import re

def scrape_travel_deals():
    # URL targeting travel credit card deals
    url = "https://thepointsguy.com/credit-cards/travel/" 
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print(f"Fetching {url}...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        deals = []
        # Finding deal cards using researched selectors
        cards = soup.select('.cardsTableRow') 
        print(f"Found {len(cards)} deal rows.")
        
        for card in cards:
            name_el = card.select_one('.cardName')
            bonus_el = card.select_one('.introOffer-C span:first-child')
            fee_el = card.select_one('.annualFee strong')
            link_el = card.select_one('a.applyLink')
            details_el = card.select_one('.tooltipContent')
            img_el = card.select_one('.cardImgContainer img')
            
            if name_el:
                name = name_el.get_text(strip=True)
                bonus = bonus_el.get_text(strip=True) if bonus_el else "Check site"
                fee = fee_el.get_text(strip=True) if fee_el else "Check site"
                link = link_el['href'] if link_el and 'href' in link_el.attrs else url
                image = img_el['src'] if img_el and 'src' in img_el.attrs else "assets/chase-sapphire.png"
                
                # Ensure the image URL is absolute
                if image.startswith('/'):
                    image = "https://thepointsguy.com" + image
                
                # Extract spend from details text
                details_text = details_el.get_text(strip=True) if details_el else ""
                spend_match = re.search(r'spend\s+(\$[\d,]+)', details_text, re.IGNORECASE)
                spend = spend_match.group(1) if spend_match else "See details"
                
                # Determine category based on name or presence
                category = "travel"
                if "cash" in name.lower():
                    category = "cashback"
                
                deal = {
                    "name": name,
                    "bonus": bonus,
                    "spend": spend,
                    "fee": fee,
                    "link": link,
                    "category": category,
                    "credit_score": "700-850",
                    "image": image
                }
                deals.append(deal)
        
        if deals:
            with open('data/deals.json', 'w') as f:
                json.dump(deals, f, indent=2)
            print(f"Successfully scraped {len(deals)} deals.")
        else:
            print("No deals found. Selectors might have changed.")
            
    except Exception as e:
        print(f"Scraping error: {e}")

if __name__ == "__main__":
    scrape_travel_deals()
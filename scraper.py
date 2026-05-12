import json
import requests
from bs4 import BeautifulSoup
import re
import os
from datetime import datetime

def send_telegram_message(message):
    token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')
    
    if not token or not chat_id:
        print("Telegram credentials not found. Skipping notification.")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("Telegram message sent successfully.")
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")

def scrape_travel_deals():
    # URL targeting travel credit card deals
    url = "https://thepointsguy.com/credit-cards/travel/" 
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Load existing deals to compare
        old_deals = []
        if os.path.exists('data/deals.json'):
            with open('data/deals.json', 'r') as f:
                data = json.load(f)
                # Ensure we handle the structure correctly: 
                # Our scraper expects a dict with 'deals', but process_excel outputs a raw list.
                if isinstance(data, dict):
                    old_deals = data.get('deals', [])
                else:
                    old_deals = data

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
            # Using flexible selectors for fields that change frequently
            bonus_el = card.select_one('div[class*="introOffer"] span:first-child') or card.select_one('.offerLabel span')
            fee_el = card.select_one('.annualFee strong')
            link_el = card.select_one('a.applyLink')
            details_el = card.select_one('.tooltipContent')
            img_el = card.select_one('.cardImage img') or card.select_one('img[class*="cardImage"]')
            
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
                    "image": image,
                    "top_perk": details_text[:100] + "..." if details_text else "Check site for perks"
                }
                deals.append(deal)
        
        if deals:
            # Check for new deals to notify
            old_names = {d.get('name', '') for d in old_deals}
            new_deals = [d for d in deals if d.get('name', '') not in old_names]
            
            if new_deals:
                msg = f"<b>🔥 {len(new_deals)} New Credit Card Deals Found!</b>\n\n"
                for d in new_deals:
                    msg += f"• <b>{d['name']}</b>: {d['bonus']}\n"
                msg += f"\n<a href='https://cbarran.github.io/credit-card-deals/'>View all deals here</a>"
                send_telegram_message(msg)

            # Save data with metadata
            output = {
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "deals_count": len(deals),
                "deals": deals
            }
            
            os.makedirs('data', exist_ok=True)
            with open('data/deals.json', 'w') as f:
                json.dump(output, f, indent=2)
            print(f"Successfully scraped {len(deals)} deals.")
        else:
            print("No deals found. Selectors might have changed.")
            
    except Exception as e:
        print(f"Scraping error: {e}")

if __name__ == "__main__":
    scrape_travel_deals()
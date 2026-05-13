import json
import os

def refine_deals():
    file_path = 'data/deals.json'
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Master Transfer Partner Mapping
    # Note: These are common transfer partners for major US banks
    TRANSFERS = {
        "Amex Transfer Partners": [
            "Delta Air Lines", "British Airways", "Emirates", "Etihad", "Hawaiian Airlines", 
            "Virgin Atlantic", "Air Canada", "Air France/KLM", "Singapore Airlines", 
            "ANA", "Cathay Pacific", "JetBlue"
        ],
        "Chase Transfer Partners": [
            "United Airlines", "Southwest Airlines", "JetBlue", "British Airways", 
            "Emirates", "Virgin Atlantic", "Air Canada", "Air France/KLM", 
            "Singapore Airlines", "Iberia", "Aer Lingus"
        ],
        "Capital One Partners": [
            "British Airways", "Emirates", "Etihad", "Virgin Atlantic", "Air Canada", 
            "Air France/KLM", "Singapore Airlines", "Turkish Airlines", "Finnair",
            "Avianca", "EVA Air"
        ],
        "Citi Transfer Partners": [
            "JetBlue", "Emirates", "Etihad", "Virgin Atlantic", "Air Canada", 
            "Air France/KLM", "Singapore Airlines", "Turkish Airlines", "Qatar Airways",
            "Thai Airways", "Avianca"
        ],
        "Bilt Rewards Partners": [
            "American Airlines", "United Airlines", "British Airways", "Emirates", 
            "Hawaiian Airlines", "Virgin Atlantic", "Air Canada", "Air France/KLM", 
            "Turkish Airlines", "Iberia"
        ]
    }

    for deal in data['deals']:
        name = deal.get('name', '').lower()
        issuer = deal.get('issuer', '').lower()
        
        # 1. Determine the Primary Airline Partner / Program
        partner = "Universal Travel" # Default
        
        # Co-brands
        if "delta" in name: partner = "Delta Air Lines"
        elif "american airlines" in name or "aadvantage" in name: partner = "American Airlines"
        elif "united" in name: partner = "United Airlines"
        elif "southwest" in name: partner = "Southwest Airlines"
        elif "jetblue" in name: partner = "JetBlue"
        elif "alaska" in name: partner = "Alaska Airlines"
        elif "hawaiian" in name: partner = "Hawaiian Airlines"
        elif "british airways" in name: partner = "British Airways"
        elif "emirates" in name: partner = "Emirates"
        elif "etihad" in name: partner = "Etihad"
        elif "virgin atlantic" in name: partner = "Virgin Atlantic"
        elif "frontier" in name: partner = "Frontier Airlines"
        elif "spirit" in name: partner = "Spirit Airlines"
        elif "allegiant" in name: partner = "Allegiant Air"
        elif "sun country" in name: partner = "Sun Country Airlines"
        elif "air canada" in name or "aeroplan" in name: partner = "Air Canada"
        
        # Transfer Programs (If not a co-brand)
        elif "membership rewards" in deal.get('card_family', '').lower() or ("american express" in issuer and ("gold" in name or "platinum" in name or "green" in name or "everyday" in name)):
            partner = "Amex Transfer Partners"
        elif "ultimate rewards" in deal.get('card_family', '').lower() or ("chase" in issuer and ("sapphire" in name or "ink" in name or "freedom" in name)):
            partner = "Chase Transfer Partners"
        elif "venture" in name or "spark" in name:
            partner = "Capital One Partners"
        elif "thankyou" in deal.get('card_family', '').lower() or ("citi" in issuer and ("premier" in name or "prestige" in name or "custom cash" in name or "double cash" in name)):
            partner = "Citi Transfer Partners"
        elif "bilt" in name:
            partner = "Bilt Rewards Partners"
        
        # Cash Back / Low Interest / Generic
        elif "cash" in name or "double cash" in name or "custom cash" in name or "active cash" in name or "platinum" in name or "secured" in name:
            # If it was already caught by a transfer program (like Citi Double Cash), keep it.
            # Otherwise, it's probably cash back.
            if partner == "Universal Travel":
                partner = "Cash Back"

        deal['airline_partner'] = partner

        # 2. Build the eligible_airlines list for filtering
        eligible = []
        if partner in TRANSFERS:
            eligible = TRANSFERS[partner]
        elif partner != "Cash Back" and partner != "Universal Travel":
            eligible = [partner]
        
        deal['eligible_airlines'] = eligible

        # 3. Standardize points_currency (One more pass for safety)
        if partner == "Amex Transfer Partners": deal['points_currency'] = "Membership Rewards"
        elif partner == "Chase Transfer Partners": deal['points_currency'] = "Ultimate Rewards"
        elif partner == "Capital One Partners": deal['points_currency'] = "Miles"
        elif partner == "Citi Transfer Partners": deal['points_currency'] = "ThankYou Points"
        elif partner == "Bilt Rewards Partners": deal['points_currency'] = "Bilt Points"
        elif partner == "Delta Air Lines": deal['points_currency'] = "SkyMiles"
        elif partner == "American Airlines": deal['points_currency'] = "AAdvantage Miles"
        elif partner == "United Airlines": deal['points_currency'] = "MileagePlus Miles"
        elif partner == "Southwest Airlines": deal['points_currency'] = "Rapid Rewards Points"
        elif partner == "JetBlue": deal['points_currency'] = "TrueBlue Points"
        elif "cash" in partner.lower() or partner == "Cash Back": deal['points_currency'] = "Cash Back"
        else:
            if not deal.get('points_currency'):
                deal['points_currency'] = "Points"

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print(f"Successfully refined {len(data['deals'])} deals.")

if __name__ == "__main__":
    refine_deals()

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
    TRANSFERS = {
        "Amex Transfer Partners": [
            "Delta Air Lines", "British Airways", "Emirates", "Etihad", "Hawaiian Airlines", 
            "Virgin Atlantic", "Air Canada", "Air France/KLM", "Singapore Airlines", 
            "ANA", "Cathay Pacific", "JetBlue", "Aer Lingus", "Iberia", "Qantas", 
            "Qatar Airways", "Aeroméxico"
        ],
        "Chase Transfer Partners": [
            "United Airlines", "Southwest Airlines", "JetBlue", "British Airways", 
            "Emirates", "Virgin Atlantic", "Air Canada", "Air France/KLM", 
            "Singapore Airlines", "Iberia", "Aer Lingus"
        ],
        "Capital One Partners": [
            "British Airways", "Emirates", "Etihad", "Virgin Atlantic", "Air Canada", 
            "Air France/KLM", "Singapore Airlines", "Turkish Airlines", "Finnair",
            "Avianca", "EVA Air", "Cathay Pacific", "Qantas", "TAP Air Portugal"
        ],
        "Citi Transfer Partners": [
            "JetBlue", "Emirates", "Etihad", "Virgin Atlantic", "Air Canada", 
            "Air France/KLM", "Singapore Airlines", "Turkish Airlines", "Qatar Airways",
            "Thai Airways", "Avianca", "Aeroméxico", "Cathay Pacific"
        ],
        "Bilt Rewards Partners": [
            "Alaska Airlines", "American Airlines", "United Airlines", "British Airways", 
            "Emirates", "Hawaiian Airlines", "Virgin Atlantic", "Air Canada", 
            "Air France/KLM", "Turkish Airlines", "Iberia", "Aer Lingus", "Cathay Pacific"
        ],
        "Wells Fargo Partners": [
            "Aer Lingus", "Air France/KLM", "Avianca", "British Airways", "Iberia"
        ]
    }

    for deal in data['deals']:
        name = deal.get('name', '').lower()
        issuer = deal.get('issuer', '').lower()
        card_family = deal.get('card_family', '').lower()
        
        # 1. Determine the Primary Airline Partner / Program
        partner = "Universal Travel" # Default
        
        # Specific Airline Co-brands
        if "delta" in name or "skymiles" in name: partner = "Delta Air Lines"
        elif "american airlines" in name or "aadvantage" in name: partner = "American Airlines"
        elif "united" in name or "mileageplus" in name: partner = "United Airlines"
        elif "southwest" in name or "rapid rewards" in name: partner = "Southwest Airlines"
        elif "jetblue" in name or "trueblue" in name: partner = "JetBlue"
        elif "alaska" in name: partner = "Alaska Airlines"
        elif "hawaiian" in name: partner = "Hawaiian Airlines"
        elif "british airways" in name: partner = "British Airways"
        elif "iberia" in name: partner = "Iberia"
        elif "aer lingus" in name: partner = "Aer Lingus"
        elif "emirates" in name: partner = "Emirates"
        elif "etihad" in name: partner = "Etihad"
        elif "virgin atlantic" in name: partner = "Virgin Atlantic"
        elif "frontier" in name: partner = "Frontier Airlines"
        elif "spirit" in name: partner = "Spirit Airlines"
        elif "allegiant" in name: partner = "Allegiant Air"
        elif "sun country" in name: partner = "Sun Country Airlines"
        elif "air canada" in name or "aeroplan" in name: partner = "Air Canada"
        elif "air france" in name or "klm" in name or "flying blue" in name: partner = "Air France/KLM"
        elif "avianca" in name or "lifemiles" in name: partner = "Avianca"
        elif "turkish" in name: partner = "Turkish Airlines"
        elif "qatar" in name: partner = "Qatar Airways"
        elif "aeromexico" in name: partner = "Aeroméxico"
        elif "skypass" in name: partner = "Korean Air"
        elif "latam" in name: partner = "LATAM Airlines"
        
        # Transfer Programs (If not a co-brand)
        elif "membership rewards" in card_family or ("american express" in issuer and ("gold" in name or "platinum" in name or "green" in name or "everyday" in name)):
            partner = "Amex Transfer Partners"
        elif "ultimate rewards" in card_family or ("chase" in issuer and ("sapphire" in name or "ink" in name or "freedom" in name)):
            partner = "Chase Transfer Partners"
        elif "venture" in name or "spark" in name or "venture x" in name:
            partner = "Capital One Partners"
        elif "thankyou" in card_family or ("citi" in issuer and ("premier" in name or "prestige" in name or "custom cash" in name or "double cash" in name)):
            partner = "Citi Transfer Partners"
        elif "bilt" in name:
            partner = "Bilt Rewards Partners"
        elif "wells fargo" in issuer and ("autograph" in name):
            partner = "Wells Fargo Partners"
            
        # Hotel Brands (Consolidate them)
        elif any(brand in name for brand in ["marriott", "bonvoy", "hilton", "hyatt", "ihg", "wyndham", "choice privileges", "best western"]):
            partner = "Hotel Rewards"
            
        # Retail / Generic Co-brands
        elif any(brand in name for brand in ["amazon", "target", "walmart", "lowe's", "best buy", "apple", "verizon", "disney", "carnival", "costco", "sam's club", "nhl", "one key", "aaa"]):
            partner = "Retail/Co-brand"
        
        # Cash Back / Low Interest / Generic
        elif any(word in name for word in ["cash", "double cash", "custom cash", "active cash", "savor", "quicksilver", "blue cash", "discover it"]):
            # If it's a bank card that earns points (caught above), keep that.
            # Otherwise, it's cash back.
            if partner == "Universal Travel":
                partner = "Cash Back"
        elif "secured" in name or "platinum" in name and partner == "Universal Travel":
            # Many "Platinum" cards are basic cards (e.g. Capital One Platinum)
            if "american express" not in issuer: # Amex Platinum is travel
                partner = "Cash Back"

        deal['airline_partner'] = partner

        # 2. Build the eligible_airlines list for filtering
        eligible = []
        if partner in TRANSFERS:
            eligible = TRANSFERS[partner]
        elif partner not in ["Cash Back", "Universal Travel", "Hotel Rewards", "Retail/Co-brand"]:
            eligible = [partner]
        
        deal['eligible_airlines'] = eligible

        # 3. Standardize points_currency
        if partner == "Amex Transfer Partners": deal['points_currency'] = "Membership Rewards"
        elif partner == "Chase Transfer Partners": deal['points_currency'] = "Ultimate Rewards"
        elif partner == "Capital One Partners": deal['points_currency'] = "Miles"
        elif partner == "Citi Transfer Partners": deal['points_currency'] = "ThankYou Points"
        elif partner == "Bilt Rewards Partners": deal['points_currency'] = "Bilt Points"
        elif partner == "Wells Fargo Partners": deal['points_currency'] = "Wells Fargo Rewards"
        elif partner == "Delta Air Lines": deal['points_currency'] = "SkyMiles"
        elif partner == "American Airlines": deal['points_currency'] = "AAdvantage Miles"
        elif partner == "United Airlines": deal['points_currency'] = "MileagePlus Miles"
        elif partner == "Southwest Airlines": deal['points_currency'] = "Rapid Rewards Points"
        elif partner == "JetBlue": deal['points_currency'] = "TrueBlue Points"
        elif partner == "Air Canada": deal['points_currency'] = "Aeroplan Points"
        elif partner == "Avianca": deal['points_currency'] = "LifeMiles"
        elif partner == "Alaska Airlines": deal['points_currency'] = "Mileage Plan Miles"
        elif partner == "Cash Back": deal['points_currency'] = "Cash Back"
        else:
            if not deal.get('points_currency'):
                deal['points_currency'] = "Points"

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print(f"Successfully refined {len(data['deals'])} deals with v4 logic.")

if __name__ == "__main__":
    refine_deals()

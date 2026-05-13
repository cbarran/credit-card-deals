import json
import os

file_path = r'c:\Users\chris\Documents\credit-card-deals\data\deals.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

deals = data['deals']

for deal in deals:
    name = deal.get('name', '').lower()
    issuer = deal.get('issuer', '').lower()
    
    # 1. Fix Points Currency based on Issuer
    if 'american express' in issuer:
        deal['points_currency'] = 'Membership Rewards'
    elif 'chase' in issuer:
        deal['points_currency'] = 'Ultimate Rewards'
    elif 'capital one' in issuer:
        deal['points_currency'] = 'Venture Miles'
    elif 'citi' in issuer:
        deal['points_currency'] = 'ThankYou Points'
    elif 'wells fargo' in issuer:
        deal['points_currency'] = 'Wells Fargo Rewards'
    
    # 2. Fix Airline Partner
    # Priority: Specific Airline Cards
    if 'delta' in name:
        deal['airline_partner'] = 'Delta Air Lines'
    elif 'united' in name:
        deal['airline_partner'] = 'United Airlines'
    elif 'southwest' in name:
        deal['airline_partner'] = 'Southwest Airlines'
    elif 'american airlines' in name or 'aadvantage' in name:
        deal['airline_partner'] = 'American Airlines'
    elif 'jetblue' in name:
        deal['airline_partner'] = 'JetBlue'
    elif 'alaska' in name:
        deal['airline_partner'] = 'Alaska Airlines'
    elif 'british airways' in name:
        deal['airline_partner'] = 'British Airways'
    elif 'marriott' in name:
        deal['airline_partner'] = 'Marriott Bonvoy'
    elif 'hilton' in name:
        deal['airline_partner'] = 'Hilton Honors'
    
    # Secondary: Generic Transfer Partners based on Issuer
    elif not deal.get('airline_partner'):
        if 'american express' in issuer:
            deal['airline_partner'] = 'Delta Air Lines'
        elif 'chase' in issuer:
            deal['airline_partner'] = 'United Airlines'
        elif 'capital one' in issuer:
            deal['airline_partner'] = 'Capital One Partners'
        elif 'citi' in issuer:
            deal['airline_partner'] = 'JetBlue'
        else:
            deal['airline_partner'] = 'Universal Travel'

# Save back
with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Updated {len(deals)} cards.")

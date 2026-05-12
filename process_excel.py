import pandas as pd
import json
import os
from datetime import datetime

# Source file
EXCEL_FILE = 'merged_credit_cards_jade_ingestion_2026_FLIP_CARD_READY.xlsx'
OUTPUT_FILE = 'data/deals.json'

def process_ingestion():
    if not os.path.exists(EXCEL_FILE):
        print(f"Error: {EXCEL_FILE} not found.")
        return

    print(f"Processing {EXCEL_FILE}...")
    
    # Read the excel file
    df = pd.read_excel(EXCEL_FILE)
    
    # Filter only active cards
    if 'is_active' in df.columns:
        df = df[df['is_active'] == True]
    
    # Sort by ranking_score if available
    if 'ranking_score' in df.columns:
        df = df.sort_values(by='ranking_score', ascending=False)
    
    # Fill missing values and ensure clean data (nulls instead of NaNs)
    df = df.replace({pd.NA: None, float('nan'): None})
    df = df.where(pd.notnull(df), None)
    
    # Convert to list of dicts
    deals = df.to_dict(orient='records')
    
    # Clean up paths (remove leading slash if present, to make them relative)
    for deal in deals:
        for field in ['image_url', 'art_image_url', 'card_image_url', 'issuer_logo_url']:
            if deal.get(field) and isinstance(deal[field], str) and deal[field].startswith('/'):
                deal[field] = deal[field][1:] # Remove leading /
        
        # Handle key_benefits if it's a string
        if isinstance(deal.get('key_benefits'), str):
            deal['key_benefits'] = [b.strip() for b in deal['key_benefits'].split(',')]

    # Create the final output structure
    output = {
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "deals_count": len(deals),
        "deals": deals
    }
    
    # Ensure data directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Save to json
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Successfully processed {len(deals)} deals into {OUTPUT_FILE}.")

if __name__ == "__main__":
    process_ingestion()
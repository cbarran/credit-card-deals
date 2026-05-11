import pandas as pd
import json

# Read the excel file
df = pd.read_excel('top_100_credit_cards_2026.xlsx')

# Convert to list of dictionaries
deals = df.to_dict(orient='records')

# Save to json
with open('data/deals.json', 'w') as f:
    json.dump(deals, f, indent=2)

print(f"Successfully processed {len(deals)} deals.")
import json

def list_universal_travel():
    file_path = 'data/deals.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("Cards with 'Universal Travel':")
    for deal in data['deals']:
        if deal.get('airline_partner') == 'Universal Travel':
            print(f"- {deal.get('name')} ({deal.get('issuer')})")

if __name__ == "__main__":
    list_universal_travel()

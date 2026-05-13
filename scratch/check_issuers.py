import json

def check_issuers():
    file_path = 'data/deals.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issuers = set()
    for deal in data['deals']:
        issuers.add(deal.get('issuer', 'MISSING'))
    
    print("Issuers found:")
    for issuer in sorted(issuers):
        print(f"- '{issuer}'")

if __name__ == "__main__":
    check_issuers()

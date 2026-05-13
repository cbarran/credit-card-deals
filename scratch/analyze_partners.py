import json
import collections

def analyze_partners():
    file_path = 'data/deals.json'
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    partners = collections.Counter()
    for deal in data['deals']:
        partners[deal.get('airline_partner', 'MISSING')] += 1
    
    print("Partner Counts:")
    for partner, count in partners.most_common():
        print(f"{partner}: {count}")

if __name__ == "__main__":
    analyze_partners()

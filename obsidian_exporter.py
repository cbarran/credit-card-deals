import json
import os

def export_to_obsidian(json_path='C:/Users/User 1/.openclaw/workspace/credit-card-deals/data/deals.json', output_path='obsidian_deals.md'):
    if not os.path.exists(json_path):
        print(f"Data file not found at: {os.path.abspath(json_path)}")
        return

    with open(json_path, 'r') as f:
        data = json.load(f)
        deals = data.get('deals', data)

    with open(output_path, 'w') as f:
        f.write("# Credit Card Deals\n\n")
        f.write(f"Last updated: {data.get('last_updated', '(Generated today)')}\n\n")
        
        for deal in deals:
            f.write(f"## {deal.get('name', 'Unknown Card')}\n")
            f.write(f"- **Issuer:** {deal.get('issuer', 'Unknown')}\n")
            f.write(f"- [Apply Here]({deal.get('application_link', '#')})\n\n")
            
    print(f"Exported {len(deals)} deals to {output_path}")

if __name__ == "__main__":
    export_to_obsidian()

import json

def sync_js():
    with open('data/deals.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    with open('data/deals.js', 'w', encoding='utf-8') as f:
        f.write('window.DEALS_DATA = ')
        json.dump(data, f, indent=2)
        f.write(';')

if __name__ == "__main__":
    sync_js()

import json
from datetime import datetime

# 1. Update Sitemap
def update_sitemap():
    with open('data/deals.json', 'r') as f:
        data = json.load(f)
        deals = data.get('deals', data)
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += '  <url>\n    <loc>https://travelcard.info/</loc>\n    <lastmod>' + datetime.now().strftime('%Y-%m-%d') + '</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n'
    
    # Static Pages (Publisher Content)
    static_pages = [
        ('guides.html', 'weekly', '0.9'),
        ('about.html', 'monthly', '0.7'),
        ('guide-nyc-travel.html', 'weekly', '0.9'),
        ('guide-nyc-arrival.html', 'weekly', '0.9'),
        ('guide-nyc-food.html', 'weekly', '0.9'),
        ('guide-nyc-culture.html', 'weekly', '0.9'),
        ('guide-nyc-architecture.html', 'weekly', '0.9'),
        ('guide-nyc-entertainment.html', 'weekly', '0.9'),
        ('privacy-policy.html', 'monthly', '0.5')
    ]
    for page, freq, prio in static_pages:
        sitemap += f'  <url>\n    <loc>https://travelcard.info/{page}</loc>\n    <changefreq>{freq}</changefreq>\n    <priority>{prio}</priority>\n  </url>\n'

    for deal in deals:
        # Use existing slug or generate from name
        slug = deal.get('slug')
        if not slug:
            slug = deal.get('name', 'card').lower().replace(' ', '-').replace('®', '').replace('℠', '')
            slug = "".join([c for c in slug if c.isalnum() or c == '-'])
        
        sitemap += f'  <url>\n    <loc>https://travelcard.info/card/{slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    
    sitemap += '</urlset>'
    with open('sitemap.xml', 'w') as f:
        f.write(sitemap)
    print("Sitemap updated.")

if __name__ == "__main__":
    update_sitemap()
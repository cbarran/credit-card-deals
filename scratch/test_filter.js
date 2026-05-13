const fs = require('fs');

// Simulate the DOM and data load
const dealsData = JSON.parse(fs.readFileSync('data/deals.json', 'utf8'));
const allDeals = dealsData.deals;

function testFilter(airlineName) {
    const airline = airlineName.toLowerCase();
    
    let filteredDeals = allDeals.filter(deal => {
        const matchesAirline = airline === 'all' ? true : (deal.eligible_airlines && deal.eligible_airlines.some(a => a.toLowerCase() === airline));
        return matchesAirline;
    });

    console.log(`\nTesting filter for: "${airlineName}"`);
    console.log(`Found ${filteredDeals.length} cards.`);
    
    // Print top 3 matches to verify
    filteredDeals.slice(0, 3).forEach(d => {
        console.log(` - ${d.name} (Eligible Airlines: ${d.eligible_airlines.slice(0,3).join(', ')}${d.eligible_airlines.length>3?', ...':''})`);
    });
}

testFilter('Delta Air Lines');
testFilter('Southwest Airlines');
testFilter('Korean Air');
testFilter('ANA');

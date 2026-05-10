document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('deals-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let allDeals = [];

    // Fetch and display deals
    async function fetchDeals() {
        try {
            const response = await fetch('data/deals.json');
            if (!response.ok) throw new Error('Failed to fetch deals');
            allDeals = await response.json();
            renderDeals(allDeals);
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = `<p class="error-message">Oops! We couldn't load the deals. Please try again later.</p>`;
        }
    }

    function renderDeals(deals) {
        container.innerHTML = '';
        
        if (deals.length === 0) {
            container.innerHTML = '<p class="no-results">No deals found for this category.</p>';
            return;
        }

        deals.forEach((deal, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${deal.image}" alt="${deal.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x180/1e293b/38bdf8?text=${encodeURIComponent(deal.name)}'">
                </div>
                <div class="bonus-tag">${deal.bonus}</div>
                <h3>${deal.name}</h3>
                <div class="card-details">
                    <div class="detail-item">
                        <span>Min. Spend</span>
                        <p>${deal.spend}</p>
                    </div>
                    <div class="detail-item">
                        <span>Annual Fee</span>
                        <p>${deal.fee}</p>
                    </div>
                    <div class="detail-item">
                        <span>Credit Score</span>
                        <p>${deal.credit_score}</p>
                    </div>
                    <div class="detail-item">
                        <span>Category</span>
                        <p style="text-transform: capitalize;">${deal.category.replace('-', ' ')}</p>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="${deal.link}" class="btn btn-outline" style="width: 100%; text-align: center;">View Details</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Filter handling
    const searchInput = document.getElementById('search-input');
    let activeFilter = 'all';

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        
        const filteredDeals = allDeals.filter(deal => {
            const matchesCategory = activeFilter === 'all' 
                ? true 
                : (activeFilter === 'no-fee' 
                    ? (deal.fee === '$0' || deal.fee.toLowerCase().includes('none'))
                    : deal.category === activeFilter);
            
            const matchesSearch = deal.name.toLowerCase().includes(query) || 
                                 deal.bonus.toLowerCase().includes(query);
            
            return matchesCategory && matchesSearch;
        });
        
        renderDeals(filteredDeals);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            applyFilters();
        });
    });

    searchInput.addEventListener('input', applyFilters);

    fetchDeals();
});
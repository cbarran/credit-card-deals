document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('deals-container');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const compareBar = document.getElementById('compare-bar');
    const compareCount = document.getElementById('compare-count');
    const compareNowBtn = document.getElementById('compare-now');
    const clearCompareBtn = document.getElementById('clear-compare');
    const compareModal = document.getElementById('compare-modal');
    const closeModal = document.querySelector('.close-modal');
    const compareTableContainer = document.getElementById('compare-table-container');
    const alertToggle = document.getElementById('deal-alerts');

    let allDeals = [];
    let selectedCards = [];
    let activeFilter = 'all';

    // Fetch and display deals
    async function fetchDeals() {
        try {
            const response = await fetch('data/deals.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error('Failed to fetch deals');
            const data = await response.json();
            
            // Handle the new structure {last_updated, deals, ...}
            allDeals = data.deals || data; 
            
            if (data.last_updated) {
                const badge = document.getElementById('last-updated-badge');
                if (badge) badge.textContent = `| Last Scanned: ${data.last_updated}`;
            }
            
            renderDeals(allDeals);
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = `<p class="error-message">Oops! We couldn't load the deals.</p>`;
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
            
            const isSelected = selectedCards.find(c => c.name === deal.name);
            
            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${deal.image}" alt="${deal.name}" class="card-img" onerror="this.src='https://via.placeholder.com/300x180/1e293b/38bdf8?text=Card'">
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
                </div>
                <div class="card-actions">
                    <button class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} compare-btn" data-name="${deal.name}">
                        ${isSelected ? 'Selected' : 'Compare'}
                    </button>
                    <a href="${deal.link}" class="btn btn-primary">View Offer</a>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners to compare buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-name');
                toggleCompare(name);
            });
        });
    }

    function toggleCompare(name) {
        const deal = allDeals.find(d => d.name === name);
        const index = selectedCards.findIndex(c => c.name === name);

        if (index > -1) {
            selectedCards.splice(index, 1);
        } else {
            if (selectedCards.length < 3) {
                selectedCards.push(deal);
            } else {
                alert('You can only compare up to 3 cards at a time.');
                return;
            }
        }

        updateCompareBar();
        applyFilters(); // Re-render to update button states
    }

    function updateCompareBar() {
        if (selectedCards.length > 0) {
            compareBar.style.display = 'flex';
            compareCount.innerText = selectedCards.length;
        } else {
            compareBar.style.display = 'none';
        }
    }

    function renderCompareTable() {
        if (selectedCards.length === 0) return;

        let tableHtml = `<table class="compare-table">
            <thead>
                <tr>
                    <th>Card</th>
                    ${selectedCards.map(c => `<td><strong>${c.name}</strong></td>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Bonus</th>
                    ${selectedCards.map(c => `<td>${c.bonus}</td>`).join('')}
                </tr>
                <tr>
                    <th>Min. Spend</th>
                    ${selectedCards.map(c => `<td>${c.spend}</td>`).join('')}
                </tr>
                <tr>
                    <th>Annual Fee</th>
                    ${selectedCards.map(c => `<td>${c.fee}</td>`).join('')}
                </tr>
                <tr>
                    <th>Top Perk</th>
                    ${selectedCards.map(c => `<td>${c.top_perk || 'Check site for details'}</td>`).join('')}
                </tr>
                <tr>
                    <th>Action</th>
                    ${selectedCards.map(c => `<td><a href="${c.link}" class="btn btn-primary" style="font-size: 0.8rem; padding: 8px;">View Offer</a></td>`).join('')}
                </tr>
            </tbody>
        </table>`;

        compareTableContainer.innerHTML = tableHtml;
    }

    // Event Listeners
    compareNowBtn.addEventListener('click', () => {
        renderCompareTable();
        compareModal.style.display = 'block';
    });

    clearCompareBtn.addEventListener('click', () => {
        selectedCards = [];
        updateCompareBar();
        renderDeals(allDeals);
    });

    closeModal.addEventListener('click', () => {
        compareModal.style.display = 'none';
    });

    window.onclick = (event) => {
        if (event.target == compareModal) {
            compareModal.style.display = 'none';
        }
    };

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const filteredDeals = allDeals.filter(deal => {
            const matchesCategory = activeFilter === 'all' ? true : (activeFilter === 'no-fee' ? (deal.fee === '$0' || deal.fee.toLowerCase().includes('none')) : deal.category === activeFilter);
            const matchesSearch = deal.name.toLowerCase().includes(query) || deal.bonus.toLowerCase().includes(query);
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

    // Newsletter Form Logic (Updated)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email-input').value;
            const msg = document.getElementById('subscription-message');
            
            console.log("Subscribing:", email);
            msg.textContent = "Thanks! You're on the list for exclusive alerts.";
            msg.style.display = "block";
            msg.style.color = "#4ade80";
            newsletterForm.reset();
        });
    }

    // Deal Alerts Toggle Logic (Mock)
    if (alertToggle) {
        alertToggle.addEventListener('change', () => {
            if (alertToggle.checked) {
                alert('Push notifications enabled! You will be alerted when new top-tier deals are found.');
            } else {
                console.log('Notifications disabled');
            }
        });
    }

    fetchDeals();
});
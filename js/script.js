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

    // Calculator inputs
    const diningInput = document.getElementById('calc-dining');
    const travelInput = document.getElementById('calc-travel');
    const groceryInput = document.getElementById('calc-grocery');

    // Fetch and display deals
    async function fetchDeals() {
        // CORS Bypass: Check if data was pre-loaded via script tag
        if (window.DEALS_DATA) {
            console.log('Using pre-loaded DEALS_DATA (CORS Bypass active)');
            allDeals = window.DEALS_DATA.deals || window.DEALS_DATA;
            if (window.DEALS_DATA.last_updated) {
                const badge = document.getElementById('last-updated-badge');
                if (badge) badge.textContent = `| Last Scanned: ${window.DEALS_DATA.last_updated}`;
            }
            renderDeals(allDeals);
            return;
        }

        try {
            const response = await fetch('data/deals.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error('Failed to fetch deals');
            const data = await response.json();
            
            allDeals = data.deals || data; 
            
            if (data.last_updated) {
                const badge = document.getElementById('last-updated-badge');
                if (badge) badge.textContent = `| Last Scanned: ${data.last_updated}`;
            }
            
            renderDeals(allDeals);
        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = `<p class="error-message">Oops! We couldn't load the deals. Please refresh or try running through a local server.</p>`;
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
            
            // Map new schema fields
            const bonus = deal.signup_bonus || 'Check site';
            const spend = deal.min_spend_requirement || 'Not available';
            const fee = deal.annual_fee || 'Not available';
            const artImage = deal.art_image_url || 'assets/chase-sapphire.png';
            const realImage = deal.image_url || deal.card_image_url || 'assets/chase-sapphire.png';
            const link = deal.application_link || deal.link || '#';
            const bestFor = deal.best_for || null;
            const rewards = deal.rewards_summary || null;
            const benefits = deal.key_benefits || [];
            const creditScore = deal.credit_score_required || 'Good to Excellent';
            const bonusValue = deal.bonus_value_estimate ? `$${deal.bonus_value_estimate}` : null;
            const issuer = (deal.issuer || 'generic').toLowerCase();

            card.setAttribute('data-issuer', issuer);

            // Magic Rewards Calculation
            const dSpend = parseFloat(diningInput.value) || 0;
            const tSpend = parseFloat(travelInput.value) || 0;
            const gSpend = parseFloat(groceryInput.value) || 0;
            
            const dRate = parseFloat(deal.rewards_rate_dining) || 1;
            const tRate = parseFloat(deal.rewards_rate_travel) || 1;
            const gRate = parseFloat(deal.rewards_rate_grocery) || 1;
            const oRate = parseFloat(deal.rewards_rate_other) || 1;

            const annualEarnings = ((dSpend * dRate) + (tSpend * tRate) + (gSpend * gRate)) * 12;
            const pointsCurrency = deal.points_currency || 'Points';

            card.innerHTML = `
                ${bestFor ? `<div class="best-for-badge">${bestFor}</div>` : ''}
                <div class="card-flip-container" tabindex="0">
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${artImage}" alt="${deal.name} Art" class="card-img-flip" onerror="this.src='${realImage}'; this.onerror=()=>this.src='assets/placeholder-card.png'">
                        </div>
                        <div class="card-back">
                            <img src="${realImage}" alt="${deal.name} Card" class="card-img-flip" onerror="this.src='assets/placeholder-card.png'">
                        </div>
                    </div>
                </div>
                <div class="magic-earnings-badge">
                    What you'll earn in a year: ${Math.round(annualEarnings).toLocaleString()} ${pointsCurrency}
                </div>
                <div class="bonus-row">
                    <div class="bonus-tag">${bonus}</div>
                    ${bonusValue ? `<div class="value-badge">Estimated Value: ${bonusValue}</div>` : ''}
                </div>
                <h3>${deal.name}</h3>
                
                ${rewards ? `<p class="rewards-text"><strong>Rewards:</strong> ${rewards}</p>` : ''}
                
                <div class="card-details">
                    <div class="detail-item">
                        <span>Min. Spend</span>
                        <p>${spend}</p>
                    </div>
                    <div class="detail-item">
                        <span>Annual Fee</span>
                        <p>${fee}</p>
                    </div>
                    <div class="detail-item">
                        <span>Credit Score</span>
                        <p>${creditScore}</p>
                    </div>
                </div>

                ${benefits.length > 0 ? `
                <div class="benefits-preview">
                    <span>Key Benefits</span>
                    <ul>
                        ${benefits.slice(0, 3).map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>` : ''}

                <div class="card-footer">
                    <a href="${link}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">See details at the bank</a>
                    <button class="btn ${isSelected ? 'btn-primary' : 'btn-outline'} btn-sm compare-btn" data-name="${deal.name}">
                        ${isSelected ? 'Selected' : 'Compare'}
                    </button>
                </div>
            `;
            container.appendChild(card);
            
            // Add mobile tap support for flip
            const flipContainer = card.querySelector('.card-flip-container');
            flipContainer.addEventListener('click', (e) => {
                if (!e.target.closest('.card-actions')) {
                    flipContainer.classList.toggle('active');
                }
            });
            // Keyboard focus support
            flipContainer.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    flipContainer.classList.toggle('active');
                }
            });

            // Mood Skin Trigger
            card.addEventListener('mouseenter', () => {
                applyMoodSkin(issuer);
            });
            card.addEventListener('mouseleave', () => {
                resetMoodSkin();
            });

            // Touch support for Mood Skins
            card.addEventListener('touchstart', () => {
                applyMoodSkin(issuer);
            }, {passive: true});
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
                    ${selectedCards.map(c => `<td>${c.signup_bonus || c.bonus}</td>`).join('')}
                </tr>
                <tr>
                    <th>Min. Spend</th>
                    ${selectedCards.map(c => `<td>${c.min_spend_requirement || c.spend}</td>`).join('')}
                </tr>
                <tr>
                    <th>Annual Fee</th>
                    ${selectedCards.map(c => `<td>${c.annual_fee || c.fee}</td>`).join('')}
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
            const matchesCategory = activeFilter === 'all' ? true : (activeFilter === 'no-fee' ? (deal.annual_fee === '$0' || (deal.annual_fee && deal.annual_fee.toLowerCase().includes('none'))) : deal.category === activeFilter);
            const matchesSearch = (deal.name && deal.name.toLowerCase().includes(query)) || (deal.signup_bonus && deal.signup_bonus.toLowerCase().includes(query));
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

    // Calculator event listeners
    [diningInput, travelInput, groceryInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                applyFilters();
            });
        }
    });

    // Toggle Floating Calculator
    const calcWidget = document.getElementById('calc-widget');
    const calcToggle = document.getElementById('calc-toggle');
    if (calcWidget && calcToggle) {
        calcToggle.addEventListener('click', () => {
            calcWidget.classList.toggle('active');
        });
    }

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

    // 3D Parallax Hero
    const parallaxCard = document.getElementById('parallax-card');
    if (parallaxCard) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 25;
            const y = (window.innerHeight / 2 - e.pageY) / 25;
            parallaxCard.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
            
            // Shimmer effect
            const px = (e.pageX / window.innerWidth) * 100;
            const py = (e.pageY / window.innerHeight) * 100;
            parallaxCard.style.setProperty('--mouse-x', `${px}%`);
            parallaxCard.style.setProperty('--mouse-y', `${py}%`);
        });
    }

    // Mood Skin Logic
    const issuerColors = {
        'american express': { bg: '#0b1d3d', accent: '#fbbf24' },
        'chase': { bg: '#0a2351', accent: '#38bdf8' },
        'capital one': { bg: '#002a5c', accent: '#00c1d4' },
        'citi': { bg: '#1c2c44', accent: '#d9261c' },
        'wells fargo': { bg: '#2b1a1a', accent: '#d71e28' },
        'generic': { bg: '#0f172a', accent: '#38bdf8' }
    };

    function applyMoodSkin(issuer) {
        const config = issuerColors[issuer] || issuerColors['generic'];
        document.documentElement.style.setProperty('--mood-bg', config.bg);
        document.documentElement.style.setProperty('--mood-accent', config.accent);
    }

    function resetMoodSkin() {
        document.documentElement.style.setProperty('--mood-bg', '#0f172a');
        document.documentElement.style.setProperty('--mood-accent', '#38bdf8');
    }

    fetchDeals();
});
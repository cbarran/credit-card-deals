document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Elite Dropdown Logic
    const dropdowns = document.querySelectorAll('.elite-dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        const items = dropdown.querySelectorAll('.dropdown-item');
        const hiddenSelect = dropdown.querySelector('select');
        const selectedValueDisplay = dropdown.querySelector('.selected-value');

        // Toggle dropdown - Listen on the whole component for better UX
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            dropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });
            dropdown.classList.toggle('active');
        });

        // Item selection
        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.getAttribute('data-value');
                const text = item.textContent;

                // Update hidden select
                if (hiddenSelect) {
                    hiddenSelect.value = value;
                    // Trigger change event for existing logic
                    hiddenSelect.dispatchEvent(new Event('change'));
                }

                // Update UI
                selectedValueDisplay.textContent = text;
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Close menu
                dropdown.classList.remove('active');
            });
        });
    });

    // Close dropdowns on outside click - Corrected logic
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.elite-dropdown')) {
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // Priority: Fetch data first
    const container = document.getElementById('deals-container');

    const searchInput = document.getElementById('search-input');
    const compareBar = document.getElementById('compare-bar');
    const compareCount = document.getElementById('compare-count');
    const compareNowBtn = document.getElementById('compare-now-btn');
    const clearCompareBtn = document.getElementById('clear-comp-btn');
    const compModal = document.getElementById('comparison-modal');
    const compareTableContainer = document.getElementById('comparison-table-container');
    const alertToggle = document.getElementById('deal-alerts');

    let allDeals = [];
    let comparisonTray = [];


    // Fetch deals immediately
    fetchDeals();

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
            
            const isSelected = comparisonTray.includes(deal.name);
            
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
            const dSpend = window.currentSpending?.dining || 0;
            const tSpend = window.currentSpending?.travel || 0;
            const gSpend = window.currentSpending?.grocery || 0;
            
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
                <div class="card-insight">
                    ${bestFor ? `<strong>Why it's a winner:</strong> This card is an elite choice for ${bestFor.toLowerCase()} enthusiasts, offering some of the best ${pointsCurrency.toLowerCase()} multipliers in the current market.` : `<strong>Pro Insight:</strong> A reliable all-rounder for building your ${pointsCurrency.toLowerCase()} balance with steady, predictable returns.`}
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
                    <a href="${link}" class="button-primary" target="_blank" rel="noopener noreferrer">View Official Offer</a>
                    <button class="button-secondary compare-btn" data-name="${deal.name}">
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


        // Selection state is now handled by the unified click listener at the bottom.
    }



    // Unified comparison engine handles actions below


    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const category = document.getElementById('category-filter')?.value || 'all';
        const issuer = document.getElementById('issuer-filter')?.value || 'all';
        const sortBy = document.getElementById('sort-by')?.value || 'featured';

        let filteredDeals = allDeals.filter(deal => {
            const matchesCategory = category === 'all' ? true : (category === 'no-fee' ? (deal.annual_fee === '$0' || (deal.annual_fee && deal.annual_fee.toLowerCase().includes('none'))) : (deal.category || '').toLowerCase() === category);
            const matchesIssuer = issuer === 'all' ? true : (deal.issuer || '').toLowerCase().includes(issuer);
            const matchesSearch = (deal.name && deal.name.toLowerCase().includes(query)) || (deal.signup_bonus && deal.signup_bonus.toLowerCase().includes(query)) || (deal.issuer && deal.issuer.toLowerCase().includes(query));
            return matchesCategory && matchesIssuer && matchesSearch;
        });

        // Apply Sorting
        if (sortBy === 'bonus-high') {
            filteredDeals.sort((a, b) => {
                const valA = parseInt(a.signup_bonus?.replace(/[^0-9]/g, '') || 0);
                const valB = parseInt(b.signup_bonus?.replace(/[^0-9]/g, '') || 0);
                return valB - valA;
            });
        } else if (sortBy === 'fee-low') {
            filteredDeals.sort((a, b) => {
                const valA = parseInt(a.annual_fee?.replace(/[^0-9]/g, '') || 0);
                const valB = parseInt(b.annual_fee?.replace(/[^0-9]/g, '') || 0);
                return valA - valB;
            });
        } else if (sortBy === 'rate-high') {
            filteredDeals.sort((a, b) => {
                const valA = parseFloat(a.rewards_rate_dining) || 1;
                const valB = parseFloat(b.rewards_rate_dining) || 1;
                return valB - valA;
            });
        }

        renderDeals(filteredDeals);
    }

    // New Listeners for Smart Discovery Bar
    ['category-filter', 'issuer-filter', 'sort-by'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });

    searchInput.addEventListener('input', applyFilters);

    // Reward Estimator Drawer Logic
    const calcDrawer = document.getElementById('calc-drawer');
    const calcToggle = document.getElementById('calc-toggle');
    const closeDrawer = document.getElementById('close-drawer');
    
    const sliders = {
        dining: document.getElementById('dining-slider'),
        travel: document.getElementById('travel-slider'),
        grocery: document.getElementById('grocery-slider')
    };

    const displays = {
        dining: document.getElementById('dining-val'),
        travel: document.getElementById('travel-val'),
        grocery: document.getElementById('grocery-val'),
        total: document.getElementById('total-earnings-display')
    };

    function updateEstimator() {
        if (!sliders.dining || !sliders.travel || !sliders.grocery) return;

        const dining = parseInt(sliders.dining.value);
        const travel = parseInt(sliders.travel.value);
        const grocery = parseInt(sliders.grocery.value);

        if (displays.dining) displays.dining.textContent = `$${dining}`;
        if (displays.travel) displays.travel.textContent = `$${travel}`;
        if (displays.grocery) displays.grocery.textContent = `$${grocery}`;

        // Simple average calculation for the hero display
        // (Individual card calculations still happen in renderDeals)
        const totalYearly = (dining + travel + grocery) * 12 * 0.02; 
        if (displays.total) displays.total.textContent = `$${Math.round(totalYearly).toLocaleString()}`;
        
        // Use these values for filtering/card rewards
        window.currentSpending = { dining, travel, grocery };
        applyFilters();
    }

    if (calcToggle) {
        calcToggle.addEventListener('click', () => calcDrawer.classList.add('active'));
    }

    if (closeDrawer) {
        closeDrawer.addEventListener('click', () => calcDrawer.classList.remove('active'));
    }

    Object.values(sliders).forEach(slider => {
        if (slider) slider.addEventListener('input', updateEstimator);
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!sliders.dining || !sliders.travel || !sliders.grocery) return;
            sliders.dining.value = btn.dataset.dining;
            sliders.travel.value = btn.dataset.travel;
            sliders.grocery.value = btn.dataset.grocery;
            updateEstimator();
        });
    });

    // Initialize with default values
    updateEstimator();

    // Newsletter Form Logic (Updated)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email-input');
            const msg = document.getElementById('subscription-message');
            if (emailInput && msg) {
                console.log("Subscribing:", emailInput.value);
                msg.textContent = "Thanks! You're on the list for exclusive alerts.";
                msg.style.display = "block";
                msg.style.color = "#4ade80";
                newsletterForm.reset();
            }
        });
    }

    // Deal Alerts Toggle Logic (Mock)
    if (alertToggle) {
        alertToggle.addEventListener('change', () => {
            if (alertToggle.checked) {
                alert('Push notifications enabled! You will be alerted when new top-tier deals are found.');
            }
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

    function updateComparisonBar() {
        const bar = document.getElementById('comparison-bar');
        const countDisplay = document.getElementById('comp-count-number');
        if (!bar || !countDisplay) return;
        
        countDisplay.textContent = comparisonTray.length;
        
        if (comparisonTray.length > 0) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    }

    function renderComparison() {
        const container = document.getElementById('comparison-table-container');
        if (!container) return;
        
        const selectedDeals = allDeals.filter(d => comparisonTray.includes(d.name));
        if (selectedDeals.length === 0) {
            container.innerHTML = '<p class="empty-msg">Select at least one card to compare.</p>';
            return;
        }

        let html = `<div class="comp-table-wrapper">
            <table class="comp-matrix">
                <thead>
                    <tr>
                        <th class="sticky-col">Feature</th>
                        ${selectedDeals.map(d => `<th class="comp-card-name">${d.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sticky-col">Signup Bonus</td>
                        ${selectedDeals.map(d => `<td class="winner-cell">${d.signup_bonus || 'N/A'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Annual Fee</td>
                        ${selectedDeals.map(d => `<td>${d.annual_fee || 'N/A'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Top Benefit</td>
                        ${selectedDeals.map(d => `<td class="verdict-cell"><em>${d.key_benefits ? d.key_benefits[0] : 'Exclusive perks'}</em></td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Action</td>
                        ${selectedDeals.map(d => `<td><a href="${d.application_link || d.link || '#'}" class="button-primary" style="font-size: 0.75rem; padding: 10px;" target="_blank">View Offer</a></td>`).join('')}
                    </tr>
                </tbody>
            </table>
        </div>`;
        
        container.innerHTML = html;
    }

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.compare-btn');
        if (btn) {
            const name = btn.getAttribute('data-name');
            if (comparisonTray.includes(name)) {
                comparisonTray = comparisonTray.filter(n => n !== name);
                btn.classList.remove('active');
                btn.textContent = 'Compare';
            } else {
                if (comparisonTray.length >= 3) {
                    alert("Max 3 cards for a fair fight!");
                    return;
                }
                comparisonTray.push(name);
                btn.classList.add('active');
                btn.textContent = 'Selected';
            }
            updateComparisonBar();
        }
    });

    // 3D Parallax Hero
    const parallaxCard = document.getElementById('parallax-card');
    if (parallaxCard) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 25;
            const y = (window.innerHeight / 2 - e.pageY) / 25;
            parallaxCard.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        });
    }

    // Modal Close logic
    if (compModal) {
        const modalClose = compModal.querySelector('.close-modal');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                compModal.style.display = 'none';
            });
        }
    }

    if (compareNowBtn) {
        compareNowBtn.addEventListener('click', () => {
            renderComparison();
            if (compModal) compModal.style.display = 'block';
        });
    }

    if (clearCompareBtn) {
        clearCompareBtn.addEventListener('click', () => {
            comparisonTray = [];
            updateComparisonBar();
            applyFilters();
        });
    }


});
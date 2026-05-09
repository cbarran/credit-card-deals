fetch('data/deals.json')
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('deals-container');
        data.forEach(deal => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h2>${deal.name}</h2>
                <div class="bonus">${deal.bonus}</div>
                <div class="details">Spend: ${deal.spend}</div>
                <div class="fee">Annual Fee: ${deal.fee}</div>
                <a href="${deal.link}">Learn More</a>
            `;
            container.appendChild(card);
        });
    });
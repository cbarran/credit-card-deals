# Codex Implementation Prompt — Credit Card Hover-Flip Image System

Implement a hover-flip card image system for the credit card grid.

Each credit card should show a unique artistic front image by default using `art_image_url`. On hover, tap, or keyboard focus, the card should flip or crossfade to reveal the credit card image using `image_url`. Also support `card_image_url` as an alias/fallback for the hover-side image.

## Dataset Fields
Use:
- `art_image_url` = front-side artwork
- `image_url` = hover/back card image
- `card_image_url` = optional alias/fallback for hover/back card image

## Behavior
- Desktop: flip on hover and focus.
- Mobile: tap toggles the flipped state.
- Keyboard: focus state must reveal the back image and show an accessible outline.
- If `art_image_url` is missing, generate a CSS fallback gradient/pattern using issuer, category, and card name.
- If `image_url` is missing, use `card_image_url`. If both are missing, keep the front artwork and show a non-breaking placeholder/fallback.
- Preserve existing application link, card details, ranking, rewards, and layout.
- Do not break ingestion schema.

## HTML Structure
```html
<div class="card-art" style="--art: url('ART_IMAGE_URL'); --real: url('REAL_CARD_IMAGE_URL');" tabindex="0" role="button" aria-label="View card image">
  <div class="card-inner">
    <div class="card-face card-front"></div>
    <div class="card-face card-hover"></div>
  </div>
</div>
```

## CSS
```css
.card-art {
  width: 320px;
  max-width: 100%;
  aspect-ratio: 1.586 / 1;
  perspective: 1000px;
  border-radius: 18px;
  outline: none;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  transition: transform 0.45s ease;
  transform-style: preserve-3d;
  box-shadow: 0 12px 30px rgba(0,0,0,.18);
}

.card-art:hover .card-inner,
.card-art:focus-visible .card-inner,
.card-art.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-art:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 4px;
}

.card-face {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  backface-visibility: hidden;
}

.card-front {
  background-image: var(--art), var(--fallback-art);
}

.card-hover {
  background-image: var(--real), var(--fallback-art);
  transform: rotateY(180deg);
}
```

## JavaScript
```js
function cssUrl(value) {
  return String(value || '').replace(/[\"')]/g, '');
}

function fallbackGradient(card) {
  const seed = `${card.issuer || ''}-${card.category || ''}-${card.name || ''}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const hueA = Math.abs(hash) % 360;
  const hueB = (hueA + 55) % 360;
  return `linear-gradient(135deg, hsl(${hueA} 70% 35%), hsl(${hueB} 75% 55%))`;
}

function createCardImage(card) {
  const art = card.art_image_url || '';
  const real = card.image_url || card.card_image_url || '';
  const fallback = fallbackGradient(card);

  return `
    <div
      class="card-art"
      tabindex="0"
      role="button"
      aria-label="View ${card.name || 'credit card'} image"
      style="--art: url('${cssUrl(art)}'); --real: url('${cssUrl(real)}'); --fallback-art: ${fallback};"
    >
      <div class="card-inner">
        <div class="card-face card-front"></div>
        <div class="card-face card-hover"></div>
      </div>
    </div>
  `;
}

document.addEventListener('click', (event) => {
  const cardArt = event.target.closest('.card-art');
  if (!cardArt) return;
  cardArt.classList.toggle('is-flipped');
});
```

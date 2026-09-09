/*
 * Carousel block — full-bleed hero slideshow matching the WKND home hero.
 * Each row is a slide: one cell with the background image, one cell with the
 * title / description / CTA. Renders prev/next arrows and slide dots.
 */

function showSlide(block, index) {
  const slides = block.querySelectorAll('.carousel-slide');
  const dots = block.querySelectorAll('.carousel-dot');
  const n = slides.length;
  const i = ((index % n) + n) % n;
  slides.forEach((s, si) => {
    s.setAttribute('aria-hidden', si === i ? 'false' : 'true');
    s.classList.toggle('active', si === i);
  });
  dots.forEach((d, di) => {
    d.setAttribute('aria-selected', di === i ? 'true' : 'false');
  });
  block.dataset.active = String(i);
}

export default function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'carousel-track';

  rows.forEach((row) => {
    const cells = [...row.children];
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    const imageCell = cells.find((c) => c.querySelector('picture, img'));
    const contentCell = cells.find((c) => c !== imageCell);

    if (imageCell) {
      const img = document.createElement('div');
      img.className = 'carousel-slide-image';
      while (imageCell.firstChild) img.append(imageCell.firstChild);
      slide.append(img);
    }
    if (contentCell) {
      const content = document.createElement('div');
      content.className = 'carousel-slide-content';
      while (contentCell.firstChild) content.append(contentCell.firstChild);
      slide.append(content);
    }
    track.append(slide);
  });

  block.textContent = '';
  block.append(track);

  const slides = track.querySelectorAll('.carousel-slide');
  if (slides.length > 1) {
    // arrows
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';
    const prev = document.createElement('button');
    prev.className = 'carousel-arrow carousel-prev';
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous slide');
    const next = document.createElement('button');
    next.className = 'carousel-arrow carousel-next';
    next.type = 'button';
    next.setAttribute('aria-label', 'Next slide');
    nav.append(prev, next);
    block.append(nav);

    // dots
    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'tablist');
    slides.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => showSlide(block, i));
      dots.append(dot);
    });
    block.append(dots);

    prev.addEventListener('click', () => showSlide(block, Number(block.dataset.active || 0) - 1));
    next.addEventListener('click', () => showSlide(block, Number(block.dataset.active || 0) + 1));
  }

  showSlide(block, 0);
}

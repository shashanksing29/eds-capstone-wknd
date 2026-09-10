import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards block. Each row becomes a card (image + body). If cards carry a
 * `categories: A, B` marker paragraph, a filter-tab bar (All + each category)
 * is rendered above the grid and toggles card visibility — matching the WKND
 * "Current Adventures" filter.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  const allCats = new Set();

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    // pull out a "categories: …" paragraph into a data attribute
    const catP = [...li.querySelectorAll('p')].find((p) => /^categories:/i.test(p.textContent.trim()));
    if (catP) {
      const cats = catP.textContent.replace(/^categories:/i, '').split(',').map((c) => c.trim()).filter(Boolean);
      li.dataset.categories = cats.join('|');
      cats.forEach((c) => allCats.add(c));
      catP.remove();
    }

    // a paragraph of only facebook/twitter/instagram links → social icon bar
    const socialP = [...li.querySelectorAll('p')].find((p) => {
      const links = [...p.querySelectorAll('a')];
      return links.length > 0 && links.every((a) => /^(facebook|twitter|instagram)$/i.test(a.textContent.trim()));
    });
    if (socialP) {
      socialP.classList.add('cards-card-social');
      socialP.querySelectorAll('a').forEach((a) => {
        const network = a.textContent.trim().toLowerCase();
        a.setAttribute('aria-label', network);
        a.textContent = '';
        a.classList.add('cards-social-icon', `cards-social-${network}`);
      });
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // Render filter tabs when categories are present.
  if (allCats.size > 0) {
    const cats = ['All', ...[...allCats].sort()];
    const tabs = document.createElement('div');
    tabs.className = 'cards-filters';
    tabs.setAttribute('role', 'tablist');

    const applyFilter = (cat) => {
      ul.querySelectorAll(':scope > li').forEach((li) => {
        const liCats = (li.dataset.categories || '').split('|');
        const show = cat === 'All' || liCats.includes(cat);
        li.style.display = show ? '' : 'none';
      });
      tabs.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-selected', b.textContent === cat ? 'true' : 'false');
      });
    };

    cats.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cards-filter';
      btn.textContent = cat;
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', () => applyFilter(cat));
      tabs.append(btn);
    });

    block.prepend(tabs);
    applyFilter('All');
  }
}

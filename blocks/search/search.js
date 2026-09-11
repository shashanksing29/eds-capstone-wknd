import { createOptimizedPicture } from '../../scripts/aem.js';
import { ffetch } from '../../scripts/ffetch.js';

/*
 * Search block — reads the ?q= query from the URL, matches it against the
 * published query-index (title / description / category / author), and renders
 * matching pages as cards. Also shows the query in a heading and updates as the
 * header search form navigates here.
 *
 * Optional authored config (key/value rows):
 *   index   path to the index (default: /query-index.json)
 */

const DEFAULT_INDEX = '/query-index.json';

/** Read a single-key config (index path) from the block. */
function readIndex(block) {
  let index = DEFAULT_INDEX;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2 && cells[0].textContent.trim().toLowerCase() === 'index') {
      index = cells[1].textContent.trim() || DEFAULT_INDEX;
    }
  });
  return index;
}

/** True when the row matches every whitespace-separated term in the query. */
function matchesQuery(row, terms) {
  const haystack = [row.title, row.description, row.category, row.author, row.path]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

/** Build one result card. */
function buildCard(item) {
  const li = document.createElement('li');
  li.className = 'search-result';
  const link = document.createElement('a');
  link.href = item.path;
  link.setAttribute('aria-label', item.title || item.path);

  if (item.image) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'search-result-image';
    imgWrap.append(createOptimizedPicture(item.image, item.title || '', false, [{ width: '750' }]));
    link.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'search-result-body';
  if (item.category) {
    const cat = document.createElement('p');
    cat.className = 'search-result-category';
    cat.textContent = item.category;
    body.append(cat);
  }
  const title = document.createElement('h3');
  title.className = 'search-result-title';
  title.textContent = item.title || item.path;
  body.append(title);
  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'search-result-description';
    desc.textContent = item.description;
    body.append(desc);
  }
  link.append(body);
  li.append(link);
  return li;
}

export default async function decorate(block) {
  const index = readIndex(block);
  block.textContent = '';

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  const heading = document.createElement('h1');
  heading.className = 'search-heading';
  heading.textContent = query ? `Search results for “${query}”` : 'Search';
  block.append(heading);

  if (!query) {
    const hint = document.createElement('p');
    hint.className = 'search-empty';
    hint.textContent = 'Type a search term in the box above to find articles and adventures.';
    block.append(hint);
    return;
  }

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  try {
    const rows = await ffetch(index).all();
    const results = rows
      .filter((row) => !(row.path || '').startsWith('/nav') && !(row.path || '').startsWith('/footer'))
      .filter((row) => matchesQuery(row, terms));

    if (results.length === 0) {
      const none = document.createElement('p');
      none.className = 'search-empty';
      none.textContent = `No results found for “${query}”.`;
      block.append(none);
      return;
    }

    const count = document.createElement('p');
    count.className = 'search-count';
    count.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    block.append(count);

    const ul = document.createElement('ul');
    ul.className = 'search-results';
    results.forEach((item) => ul.append(buildCard(item)));
    block.append(ul);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('search: could not load index', index, e);
    const err = document.createElement('p');
    err.className = 'search-empty';
    err.textContent = 'Search is unavailable right now. Please try again later.';
    block.append(err);
  }
}

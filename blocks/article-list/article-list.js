import { createOptimizedPicture } from '../../scripts/aem.js';
import { ffetch } from '../../scripts/ffetch.js';

/*
 * Article List — renders WKND magazine articles dynamically from the
 * published query-index.json. Authors place the block with optional config
 * rows; the block queries the index at runtime, so newly published articles
 * appear automatically without editing this page.
 *
 * Optional authored config (key/value rows):
 *   index       path to the index (default: /query-index.json)
 *   category    filter on the indexed `category` column (default: Magazine)
 *   template    filter on the indexed `template` column (default: article)
 *   limit       max number of articles to show (default: all)
 *   path        only include pages whose path starts with this prefix
 */

const DEFAULTS = {
  index: '/query-index.json',
  category: 'Magazine',
  template: 'article',
  limit: 0,
  path: '',
  exclude: '',
};

/** Read the block's key/value config rows into an options object. */
function readConfig(block) {
  const cfg = { ...DEFAULTS };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key in cfg) cfg[key] = key === 'limit' ? parseInt(value, 10) || 0 : value;
    }
  });
  return cfg;
}

/** True when the indexed row matches the configured filters. */
function matches(row, cfg) {
  if (cfg.exclude && (row.path || '') === cfg.exclude) return false;
  if (cfg.path && !(row.path || '').startsWith(cfg.path)) return false;
  // Only apply a filter when the index actually has that column populated.
  if (cfg.category && row.category && row.category !== cfg.category) return false;
  if (cfg.template && row.template && row.template !== cfg.template) return false;
  // If category/template columns are absent from the index, fall back to path.
  if (!row.category && !row.template && cfg.path === '') {
    return (row.path || '').includes('/magazine/');
  }
  return true;
}

/** Build a compact sidebar row (title + date, no image). */
function buildCompactCard(article) {
  const li = document.createElement('li');
  li.className = 'article-list-compact-card';
  const link = document.createElement('a');
  link.href = article.path;

  const title = document.createElement('span');
  title.className = 'article-list-compact-title';
  title.textContent = article.title || article.path;
  link.append(title);

  if (article.date) {
    const ts = parseInt(article.date, 10);
    if (!Number.isNaN(ts) && ts > 0) {
      const d = new Date(ts * 1000);
      const date = document.createElement('span');
      date.className = 'article-list-compact-date';
      date.textContent = d.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'short', day: 'numeric',
      });
      link.append(date);
    }
  }
  li.append(link);
  return li;
}

/** Build one article card as an <li>. */
function buildCard(article) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const link = document.createElement('a');
  link.href = article.path;
  link.setAttribute('aria-label', article.title || article.path);

  if (article.image) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'article-list-card-image';
    const picture = createOptimizedPicture(
      article.image,
      article.title || '',
      false,
      [{ width: '750' }],
    );
    imgWrap.append(picture);
    link.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';

  if (article.category) {
    const cat = document.createElement('p');
    cat.className = 'article-list-card-category';
    cat.textContent = article.category;
    body.append(cat);
  }

  const title = document.createElement('h3');
  title.className = 'article-list-card-title';
  title.textContent = article.title || article.path;
  body.append(title);

  if (article.description) {
    const desc = document.createElement('p');
    desc.className = 'article-list-card-description';
    desc.textContent = article.description;
    body.append(desc);
  }

  const meta = [];
  if (article.author) meta.push(article.author);
  if (article.date) {
    const ts = parseInt(article.date, 10);
    if (!Number.isNaN(ts) && ts > 0) {
      const d = new Date(ts * 1000);
      meta.push(d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
  }
  if (meta.length) {
    const byline = document.createElement('p');
    byline.className = 'article-list-card-meta';
    byline.textContent = meta.join(' · ');
    body.append(byline);
  }

  link.append(body);
  li.append(link);
  return li;
}

export default async function decorate(block) {
  const cfg = readConfig(block);
  const compact = block.classList.contains('compact');
  // On an article page, drop the current article from its own sidebar list.
  if (compact && !cfg.exclude) cfg.exclude = window.location.pathname.replace(/\.html$/, '');
  block.textContent = '';

  const ul = document.createElement('ul');
  ul.className = compact ? 'article-list-compact' : 'article-list-cards';

  try {
    let articles = await ffetch(cfg.index)
      .filter((row) => matches(row, cfg))
      .all();

    // Sort newest-first when a date column is present.
    articles.sort((a, b) => (parseInt(b.date, 10) || 0) - (parseInt(a.date, 10) || 0));

    if (cfg.limit > 0) articles = articles.slice(0, cfg.limit);

    if (articles.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'article-list-empty';
      empty.textContent = 'No articles found.';
      block.append(empty);
      return;
    }

    articles.forEach((article) => ul.append(
      compact ? buildCompactCard(article) : buildCard(article),
    ));
    block.append(ul);
  } catch (e) {
    // Index may not exist yet (e.g. before first publish). Fail quietly.
    // eslint-disable-next-line no-console
    console.warn('article-list: could not load index', cfg.index, e);
    const note = document.createElement('p');
    note.className = 'article-list-empty';
    note.textContent = 'Articles will appear here once published.';
    block.append(note);
  }
}

/*
 * WKND content import script (self-contained).
 *
 * Handles all discovered WKND templates:
 *   - homepage / content-landing / faq-page / adventure-detail: default content
 *     (hero image + headings + text), chrome stripped.
 *   - article-detail (magazine): hero + title + author, rich body, and an
 *     `article-meta` metadata block feeding the query-index (author, category,
 *     publication date, image) so the Magazine listing can render dynamically.
 *   - adventure-listing: intro + a Cards block built from the teaser links.
 *
 * Images are absolutized to https://wknd.site so the importer localizes them
 * into the media_ hash store.
 */

const ORIGIN = 'https://wknd.site';

/** Absolutize every in-scope image src against the source origin. */
function absolutizeImages(main, url) {
  const base = new URL(url);
  main.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^https?:\/\//i.test(src) && !src.startsWith('data:')) {
      try {
        img.src = new URL(src, base).href;
      } catch (e) {
        // leave as-is
      }
    }
    // drop the tiny WKND logo SVGs that leak in from header fragments
    if ((img.getAttribute('src') || '').includes('wknd-logo')) {
      img.remove();
    }
  });
}

/** Absolutize links so migrated pages keep working before redirects are set. */
function fixLinks(main, url) {
  const base = new URL(url);
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      // keep internal WKND paths relative-to-root but strip .html for EDS
      a.setAttribute('href', href.replace(/\.html($|#|\?)/, '$1'));
    }
  });
}

/** Pull the main editorial container, falling back to <main>. */
function pickMain(document) {
  return (
    document.querySelector('main.container.responsivegrid')
    || document.querySelector('main.container')
    || document.querySelector('main')
    || document.body
  );
}

/** Remove site chrome that should never appear in the document body. */
function stripChrome(root, WebImporter) {
  WebImporter.DOMUtils.remove(root, [
    'header',
    'footer',
    'nav',
    '.breadcrumb',
    '.cmp-breadcrumb',
    '.experiencefragment',
    '.cmp-experiencefragment',
    '.social',
    '.cmp-sharing',
    '[class*="share"]',
    'aside',
    '.cmp-languagenavigation',
    'script',
    'style',
    'noscript',
  ]);
}

/** Detect the template from the source page's template meta tag. */
function templateOf(document) {
  const t = document.querySelector('meta[name="template"]')?.content || '';
  return t;
}

/** Build the WKND meta value block (Metadata block table). */
function buildMetadata(document, url, main, WebImporter) {
  const meta = {};
  const title = document.querySelector('title')?.textContent?.trim();
  if (title) meta.Title = title;
  const desc = document.querySelector('meta[name="description"]')?.content;
  if (desc) meta.Description = desc;

  // Hero/first content image → og image
  const firstImg = main.querySelector('img');
  if (firstImg && firstImg.src) {
    const el = document.createElement('img');
    el.src = firstImg.src;
    meta.Image = el;
  }

  const tmpl = templateOf(document);
  const path = new URL(url).pathname;

  if (tmpl.includes('article') || path.includes('/magazine/')) {
    meta.Template = 'article';
    // Category from path: /us/en/magazine/... → Magazine
    meta.Category = 'Magazine';
    // Author: the "By {name}" H4
    const byline = [...main.querySelectorAll('h4, .cmp-title__text, p')]
      .map((e) => e.textContent.trim())
      .find((t) => /^By\s+.+/i.test(t) && t.length < 60);
    if (byline) meta.Author = byline.replace(/^By\s+/i, '').trim();
  } else if (path.includes('/adventures/') && !path.endsWith('/adventures')) {
    meta.Template = 'adventure';
    meta.Category = 'Adventures';
  } else if (path.endsWith('/adventures') || path.endsWith('/adventures.html')) {
    meta.Template = 'adventure-listing';
  } else if (path.endsWith('/magazine') || path.endsWith('/magazine.html')) {
    meta.Template = 'magazine';
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
}

/** Build a Cards block from adventure teaser links (listing page). */
function buildAdventureCards(document, main, url) {
  const base = new URL(url);
  const seen = new Set();
  const cards = [];
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!/\/adventures\/[a-z0-9-]+(\.html)?$/i.test(href)) return;
    const key = href.replace(/\.html$/, '');
    if (seen.has(key)) return;
    // find an image + label for this card
    const scope = a.closest('li, article, .cmp-teaser, div') || a;
    const img = scope.querySelector('img');
    const label = (a.textContent.trim()
      || scope.querySelector('.cmp-teaser__title, h2, h3')?.textContent?.trim()
      || key.split('/').pop().replace(/-/g, ' '));
    if (!img && !label) return;
    seen.add(key);
    cards.push({ href: key, img, label });
  });
  if (cards.length === 0) return null;

  const rows = [['Cards']];
  cards.forEach(({ href, img, label }) => {
    const cell = document.createElement('div');
    if (img) {
      const im = document.createElement('img');
      im.src = /^https?:/.test(img.src) ? img.src : new URL(img.getAttribute('src'), base).href;
      cell.append(im);
    }
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    p.append(link);
    cell.append(p);
    rows.push([cell]);
  });
  return WebImporter.DOMUtils ? rows : rows;
}

export default {
  transformDOM: ({ document, url, html, params }) => {
    /* global WebImporter */
    const main = pickMain(document);
    const path = new URL(url).pathname;

    stripChrome(main, WebImporter);
    absolutizeImages(main, url);
    fixLinks(main, url);

    // Remove empty grid wrappers' noise: drop elements with no text/img
    // (keeps structure lean for markdown conversion).
    main.querySelectorAll('.cmp-title__text').forEach((h) => {
      // unwrap the cmp-title span into a plain heading text (already a heading tag)
    });

    // Build blocks appended at the end of main.
    const appended = [];

    // Adventure listing → Cards block
    if (path.endsWith('/adventures') || path.endsWith('/adventures.html')) {
      const rows = buildAdventureCards(document, main, url);
      if (rows) {
        const table = WebImporter.DOMUtils.createTable(rows, document);
        appended.push(table);
      }
    }

    // Magazine listing → dynamic Article List block driven by query-index.
    // Remove the static "All Articles" list and replace with the block so new
    // articles appear automatically once published + indexed.
    if (path.endsWith('/magazine') || path.endsWith('/magazine.html')) {
      main.querySelectorAll('ul').forEach((ul) => {
        // the article list is the UL of teaser links
        if (ul.querySelector('a')) ul.remove();
      });
      const heading = document.createElement('h2');
      heading.textContent = 'All Articles';
      appended.push(heading);
      const rows = [
        ['Article List'],
        ['category', 'Magazine'],
        ['template', 'article'],
      ];
      const table = WebImporter.DOMUtils.createTable(rows, document);
      appended.push(table);
    }

    // Metadata block (also used to feed the query index)
    const metaBlock = buildMetadata(document, url, main, WebImporter);
    if (metaBlock) appended.push(metaBlock);

    appended.forEach((el) => main.append(el));

    return main;
  },

  generateDocumentPath: ({ url }) => {
    let p = new URL(url).pathname;
    p = p.replace(/\.html$/, '');
    p = p.replace(/\/$/, '');
    if (p === '' || p === '/us/en') p = '/us/en/index';
    // eslint-disable-next-line no-undef
    return WebImporter.FileUtils.sanitizePath(p);
  },
};

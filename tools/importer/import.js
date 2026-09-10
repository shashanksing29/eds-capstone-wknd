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

/**
 * Rewrite a source WKND path to a mainstream EDS path by dropping the
 * `/us/en` locale prefix and the `.html` extension. The home page
 * (`/us/en`) maps to `/`.
 *   /us/en.html                       -> /
 *   /us/en/magazine/arctic-surfing.html -> /magazine/arctic-surfing
 *   /us/en/adventures.html            -> /adventures
 */
function mainstreamPath(pathname) {
  let p = pathname.replace(/\.html$/, '');
  p = p.replace(/^\/us\/en(\/|$)/, '/');
  p = p.replace(/\/{2,}/g, '/');
  if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
  return p === '' ? '/' : p;
}

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

/** Rewrite internal links to the mainstream path scheme (drop /us/en, .html). */
function fixLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('/')) {
      const [path, tail = ''] = href.split(/(?=[#?])/);
      a.setAttribute('href', mainstreamPath(path) + tail);
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
  } else if (path === '/us/en' || path === '/us/en.html' || path === '/us/en/' || mainstreamPath(path) === '/') {
    meta.Template = 'home';
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  return block;
}

/**
 * Map each adventure to its filter categories, derived from the WKND
 * "Current Adventures" tab panels. Keyed by adventure slug.
 */
function adventureCategoryMap(document) {
  const map = {};
  const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim());
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  panels.forEach((panel, i) => {
    const cat = tabs[i];
    if (!cat || /^all$/i.test(cat)) return;
    panel.querySelectorAll('a[href*="/adventures/"]').forEach((a) => {
      const slug = (a.getAttribute('href') || '').match(/adventures\/([a-z0-9-]+)/)?.[1];
      if (!slug) return;
      (map[slug] = map[slug] || new Set()).add(cat);
    });
  });
  return map;
}

/**
 * Build a Cards block from adventure teaser links (listing page). Each card
 * carries an image, title link, description, and a categories marker
 * (`categories: Surfing`) that cards.js reads to power the filter tabs.
 */
function buildAdventureCards(document, main, url) {
  const base = new URL(url);
  const catMap = adventureCategoryMap(document);
  const seen = new Set();
  const cards = [];
  main.querySelectorAll('article').forEach((art) => {
    const a = art.querySelector('a[href*="/adventures/"]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!/\/adventures\/[a-z0-9-]+(\.html)?$/i.test(href)) return;
    const slug = href.match(/adventures\/([a-z0-9-]+)/)?.[1] || '';
    const key = mainstreamPath(href.startsWith('http') ? new URL(href).pathname : href);
    if (seen.has(key)) return;
    const img = art.querySelector('img');
    const label = [...art.querySelectorAll('a')].map((x) => x.textContent.trim()).find(Boolean)
      || key.split('/').pop().replace(/-/g, ' ');
    // description = longest text not inside a link
    let desc = '';
    art.querySelectorAll('p, div, span').forEach((n) => {
      const t = n.textContent.trim();
      if (t && !n.querySelector('a, img') && t !== label && t.length > desc.length) desc = t;
    });
    if (!img && !label) return;
    seen.add(key);
    cards.push({
      href: key, img, label, desc, cats: [...(catMap[slug] || [])],
    });
  });
  if (cards.length === 0) return null;

  const rows = [['Cards']];
  cards.forEach(({
    href, img, label, desc, cats,
  }) => {
    const cell = document.createElement('div');
    if (img) {
      const im = document.createElement('img');
      im.src = /^https?:/.test(img.src) ? img.src : new URL(img.getAttribute('src'), base).href;
      im.alt = label;
      cell.append(im);
    }
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    p.append(link);
    cell.append(p);
    if (desc) {
      const dp = document.createElement('p');
      dp.textContent = desc;
      cell.append(dp);
    }
    if (cats.length) {
      const cp = document.createElement('p');
      cp.textContent = `categories: ${cats.join(', ')}`;
      cell.append(cp);
    }
    rows.push([cell]);
  });
  return rows;
}

/** Absolutize a possibly-relative image src against the source origin. */
function absSrc(imgEl, base) {
  const src = imgEl.getAttribute('src') || '';
  return /^https?:/.test(src) ? src : new URL(src, base).href;
}

/**
 * Build a Carousel block from every slide of the WKND home hero carousel.
 * Each slide contributes two cells: [image] and [title + description + CTA].
 * Returns table rows for WebImporter.DOMUtils.createTable, or null.
 */
function buildHomeCarousel(document, url) {
  const base = new URL(url);
  const slides = [...document.querySelectorAll('.cmp-carousel__item')];
  if (slides.length === 0) return null;

  const rows = [['Carousel']];
  slides.forEach((slide) => {
    const title = slide.querySelector('.cmp-teaser__title')?.textContent?.trim();
    const desc = slide.querySelector('.cmp-teaser__description')?.textContent?.trim();
    const ctaEl = slide.querySelector('.cmp-teaser__action-link, a');
    const imgEl = slide.querySelector('img');
    if (!title || !imgEl) return;

    const imgCell = document.createElement('div');
    const im = document.createElement('img');
    im.src = absSrc(imgEl, base);
    im.alt = imgEl.getAttribute('alt') || title;
    imgCell.append(im);

    const content = document.createElement('div');
    const h = document.createElement('h2');
    h.textContent = title;
    content.append(h);
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.append(p);
    }
    if (ctaEl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      const href = ctaEl.getAttribute('href') || '/adventures';
      a.href = mainstreamPath(href.startsWith('http') ? new URL(href).pathname : href);
      a.textContent = ctaEl.textContent.trim() || 'View Trips';
      p.append(a);
      content.append(p);
    }
    rows.push([imgCell, content]);
  });
  return rows.length > 1 ? rows : null;
}

/**
 * Convert an article/teaser list (Recent Articles, "Where do you want to go?")
 * into Cards block rows: each card is [image + title link + description].
 */
function buildCardsFromArticles(document, listEl, base) {
  const items = [...listEl.querySelectorAll('article, li')].filter((el, i, arr) => (
    // keep leaf items: articles, or li that has a link+image
    el.tagName === 'ARTICLE' || (!arr.some((o) => o !== el && o.contains(el) && o.tagName === 'ARTICLE'))
  ));
  const seen = new Set();
  const rows = [['Cards']];
  (listEl.querySelectorAll('article').length ? listEl.querySelectorAll('article') : items).forEach((art) => {
    const link = art.querySelector('a[href]');
    const img = art.querySelector('img');
    if (!link || !img) return;
    const href = mainstreamPath(link.getAttribute('href') || '');
    if (seen.has(href)) return;
    seen.add(href);
    const title = [...art.querySelectorAll('a')].map((a) => a.textContent.trim()).find(Boolean) || '';
    // description = text nodes not inside a link
    let desc = '';
    art.querySelectorAll('p, div, span').forEach((n) => {
      const t = n.textContent.trim();
      if (t && !n.querySelector('a, img') && t !== title && t.length > desc.length) desc = t;
    });

    const cell = document.createElement('div');
    const im = document.createElement('img');
    im.src = absSrc(img, base);
    im.alt = title;
    cell.append(im);
    const tp = document.createElement('p');
    const ta = document.createElement('a');
    ta.href = href;
    ta.textContent = title;
    tp.append(ta);
    cell.append(tp);
    if (desc) {
      const dp = document.createElement('p');
      dp.textContent = desc;
      cell.append(dp);
    }
    rows.push([cell]);
  });
  return rows.length > 1 ? rows : null;
}

/**
 * Convert a WKND teaser (Featured Article / Climbing New Zealand) into a
 * Columns block: text column (eyebrow + title + description + CTA) and image
 * column, side by side. Returns a table element or null.
 */
function buildFeaturedColumns(document, teaser, base, WebImporter) {
  const img = teaser.querySelector('img');
  const title = teaser.querySelector('.cmp-teaser__title')?.textContent?.trim();
  if (!img || !title) return null;

  const pre = teaser.querySelector('.cmp-teaser__pretitle')?.textContent?.trim();
  const desc = teaser.querySelector('.cmp-teaser__description')?.textContent?.trim();
  const ctaEl = teaser.querySelector('.cmp-teaser__action-link, a');

  const text = document.createElement('div');
  if (pre) {
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = pre;
    p.append(em);
    text.append(p);
  }
  const h = document.createElement('h2');
  h.textContent = title;
  text.append(h);
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    text.append(p);
  }
  if (ctaEl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    const href = ctaEl.getAttribute('href') || '/';
    a.href = mainstreamPath(href.startsWith('http') ? new URL(href).pathname : href);
    a.textContent = ctaEl.textContent.trim();
    p.append(a);
    text.append(p);
  }

  const imgCell = document.createElement('div');
  const im = document.createElement('img');
  im.src = absSrc(img, base);
  im.alt = img.getAttribute('alt') || title;
  imgCell.append(im);

  // image left, text right (WKND uses row-reverse → image first visually)
  return WebImporter.DOMUtils.createTable([['Columns (featured)'], [imgCell, text]], document);
}

/**
 * Convert a WKND teaser without a pretitle (e.g. "Climbing New Zealand") into a
 * Hero block: full-width image with a white caption card overlapping its bottom
 * (title + description + CTA), matching the WKND home hero treatment.
 */
function buildFeatureHero(document, teaser, base, WebImporter) {
  const img = teaser.querySelector('img');
  const title = teaser.querySelector('.cmp-teaser__title')?.textContent?.trim();
  if (!img || !title) return null;

  const desc = teaser.querySelector('.cmp-teaser__description')?.textContent?.trim();
  const ctaEl = teaser.querySelector('.cmp-teaser__action-link, a');

  const imgCell = document.createElement('div');
  const im = document.createElement('img');
  im.src = absSrc(img, base);
  im.alt = img.getAttribute('alt') || title;
  imgCell.append(im);

  const content = document.createElement('div');
  const h = document.createElement('h2');
  h.textContent = title;
  content.append(h);
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc;
    content.append(p);
  }
  if (ctaEl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    const href = ctaEl.getAttribute('href') || '/';
    a.href = mainstreamPath(href.startsWith('http') ? new URL(href).pathname : href);
    a.textContent = ctaEl.textContent.trim();
    p.append(a);
    content.append(p);
  }

  return WebImporter.DOMUtils.createTable([['Hero'], [imgCell], [content]], document);
}

export default {
  transformDOM: ({ document, url }) => {
    /* global WebImporter */
    const main = pickMain(document);
    const path = new URL(url).pathname;

    stripChrome(main, WebImporter);
    absolutizeImages(main, url);
    fixLinks(main);

    // Article pages repeat the title as a body heading right after the H1 —
    // drop that duplicate so the article reads cleanly.
    const h1 = main.querySelector('h1');
    if (h1) {
      const h1text = h1.textContent.trim().toLowerCase();
      main.querySelectorAll('h2, h3').forEach((h) => {
        if (h.textContent.trim().toLowerCase() === h1text) h.remove();
      });
    }

    // Build blocks appended at the end of main.
    const appended = [];

    // Home page → build a Carousel from the hero slides, convert the article
    // teaser lists (Recent Articles, "Where do you want to go?") into Cards,
    // then remove the source carousel + lists so they don't duplicate.
    const isHome = path === '/us/en' || path === '/us/en.html' || path === '/us/en/' || mainstreamPath(path) === '/';
    if (isHome) {
      const base = new URL(url);
      const carouselRows = buildHomeCarousel(document, url);

      // Convert the non-carousel teasers in place. Teasers WITH a pretitle
      // ("Featured Article") become 2-column Columns; teasers WITHOUT one
      // ("Climbing New Zealand") become a full-width Hero with an overlapping
      // caption card — matching the two distinct WKND layouts.
      const featuredTeasers = [...main.querySelectorAll('.cmp-teaser')]
        .filter((t) => !t.closest('.cmp-carousel') && t.querySelector('img'));
      featuredTeasers.forEach((teaser) => {
        const hasPretitle = !!teaser.querySelector('.cmp-teaser__pretitle')?.textContent?.trim();
        const table = hasPretitle
          ? buildFeaturedColumns(document, teaser, base, WebImporter)
          : buildFeatureHero(document, teaser, base, WebImporter);
        if (table) teaser.replaceWith(table);
      });

      // Convert each source article list into a Cards table, in place.
      const articleLists = [...main.querySelectorAll('ul')].filter((ul) => ul.querySelector('article'));
      articleLists.forEach((ul) => {
        const cardRows = buildCardsFromArticles(document, ul, base);
        if (cardRows) {
          const table = WebImporter.DOMUtils.createTable(cardRows, document);
          ul.replaceWith(table);
        }
      });

      // Remove the source carousel; prepend our Carousel block.
      WebImporter.DOMUtils.remove(main, ['.cmp-carousel', '.carousel']);
      if (carouselRows) {
        const carouselTable = WebImporter.DOMUtils.createTable(carouselRows, document);
        main.prepend(carouselTable);
      }
    }

    // Adventure listing → single Cards block.
    // The source uses JS filter tabs (All/Climbing/Cycling/…), so it ships one
    // article list per category — all visible in static HTML, which duplicates
    // content. Build one Cards block from all adventures, then strip the source
    // filter tabs (OL) and every source article list (UL) so nothing repeats.
    if (path.endsWith('/adventures') || path.endsWith('/adventures.html')) {
      const base = new URL(url);
      const rows = buildAdventureCards(document, main, url);

      // Intro teaser ("Experience the world with us") → full-width Hero with an
      // overlapping caption card, matching WKND.
      const intro = [...main.querySelectorAll('.cmp-teaser')]
        .find((t) => t.querySelector('img') && !t.closest('[role="tabpanel"]'));
      if (intro) {
        const heroTable = buildFeatureHero(document, intro, base, WebImporter);
        if (heroTable) intro.replaceWith(heroTable); else intro.remove();
      }

      // remove the category filter tab list and all source article lists
      main.querySelectorAll('ol').forEach((ol) => {
        if (/climbing|cycling|skiing|surfing|travel/i.test(ol.textContent)) ol.remove();
      });
      main.querySelectorAll('ul').forEach((ul) => {
        if (ul.querySelector('a[href*="/adventures/"], article')) ul.remove();
      });
      if (rows) {
        const table = WebImporter.DOMUtils.createTable(rows, document);
        appended.push(table);
      }
    }

    // Magazine listing: Featured Article (2-col) + dynamic Article List block.
    if (path.endsWith('/magazine') || path.endsWith('/magazine.html')) {
      const base = new URL(url);

      // Featured Article teaser (has a pretitle) → 2-column Columns block.
      // Drop the members-only teasers (Alaskan Adventure, Fly Fishing) — they
      // are gated content not shown on the public listing.
      [...main.querySelectorAll('.cmp-teaser')].forEach((teaser) => {
        if (!teaser.querySelector('img')) return;
        const hasPretitle = !!teaser.querySelector('.cmp-teaser__pretitle')?.textContent?.trim();
        if (hasPretitle) {
          const table = buildFeaturedColumns(document, teaser, base, WebImporter);
          if (table) teaser.replaceWith(table); else teaser.remove();
        } else {
          teaser.remove();
        }
      });

      // Remove the source article list + any leftover "Members Only" heading/text
      // and duplicate "All Articles"/"Featured Article" bits.
      main.querySelectorAll('ul').forEach((ul) => {
        if (ul.querySelector('a')) ul.remove();
      });
      main.querySelectorAll('h2, h3, p, hr').forEach((el) => {
        // don't touch content already moved into a generated block table
        // (the featured columns table contains the "Featured Article" eyebrow).
        if (el.closest('table')) return;
        const t = el.textContent.trim().toLowerCase();
        if (['all articles', 'members only', 'featured article'].includes(t)) el.remove();
        if (/^sign in to un-?lock/i.test(el.textContent.trim())) el.remove();
      });

      // Append a single "All Articles" heading + the dynamic Article List block.
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

    // Buttonize the remaining WKND CTA buttons (e.g. "All Articles",
    // "All Trips") left in default content — EDS only styles a link as a button
    // when it's wrapped in <strong>. Skip links inside the generated block
    // tables (carousel/columns/hero/cards style their own CTAs).
    main.querySelectorAll('a.cmp-button, .button > a[href], a.cmp-teaser__action-link').forEach((a) => {
      if (a.closest('table')) return;
      if (a.querySelector('img')) return;
      if (a.closest('strong')) return;
      const text = a.textContent.trim();
      if (!text) return;
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
    });

    return main;
  },

  generateDocumentPath: ({ url }) => {
    const p = mainstreamPath(new URL(url).pathname);
    // Home page maps to /index for the content store.
    const target = p === '/' ? '/index' : p;
    // eslint-disable-next-line no-undef
    return WebImporter.FileUtils.sanitizePath(target);
  },
};

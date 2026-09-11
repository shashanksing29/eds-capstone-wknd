/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import.js
  var import_exports = {};
  __export(import_exports, {
    default: () => import_default
  });
  function mainstreamPath(pathname) {
    let p = pathname.replace(/\.html$/, "");
    p = p.replace(/^\/us\/en(\/|$)/, "/");
    p = p.replace(/\/{2,}/g, "/");
    if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
    return p === "" ? "/" : p;
  }
  function absolutizeImages(main, url) {
    const base = new URL(url);
    main.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !/^https?:\/\//i.test(src) && !src.startsWith("data:")) {
        try {
          img.src = new URL(src, base).href;
        } catch (e) {
        }
      }
      if ((img.getAttribute("src") || "").includes("wknd-logo")) {
        img.remove();
      }
    });
  }
  function fixLinks(main) {
    main.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("/")) {
        const [path, tail = ""] = href.split(/(?=[#?])/);
        a.setAttribute("href", mainstreamPath(path) + tail);
      }
    });
  }
  function pickMain(document) {
    return document.querySelector("main.container.responsivegrid") || document.querySelector("main.container") || document.querySelector("main") || document.body;
  }
  function stripChrome(root, WebImporter2) {
    WebImporter2.DOMUtils.remove(root, [
      "header",
      "footer",
      "nav",
      ".breadcrumb",
      ".cmp-breadcrumb",
      ".experiencefragment",
      ".cmp-experiencefragment",
      ".social",
      ".cmp-sharing",
      '[class*="share"]',
      "aside",
      ".cmp-languagenavigation",
      "script",
      "style",
      "noscript"
    ]);
  }
  function templateOf(document) {
    var _a;
    const t = ((_a = document.querySelector('meta[name="template"]')) == null ? void 0 : _a.content) || "";
    return t;
  }
  function buildMetadata(document, url, main, WebImporter2) {
    var _a, _b, _c;
    const meta = {};
    const title = (_b = (_a = document.querySelector("title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
    if (title) meta.Title = title;
    const desc = (_c = document.querySelector('meta[name="description"]')) == null ? void 0 : _c.content;
    if (desc) meta.Description = desc;
    const firstImg = main.querySelector("img");
    if (firstImg && firstImg.src) {
      const el = document.createElement("img");
      el.src = firstImg.src;
      meta.Image = el;
    }
    const tmpl = templateOf(document);
    const path = new URL(url).pathname;
    if (tmpl.includes("article") || path.includes("/magazine/")) {
      meta.Template = "article";
      meta.Category = "Magazine";
      const byline = [...main.querySelectorAll("h4, .cmp-title__text, p")].map((e) => e.textContent.trim()).find((t) => /^By\s+.+/i.test(t) && t.length < 60);
      if (byline) meta.Author = byline.replace(/^By\s+/i, "").trim();
      const slug = mainstreamPath(path).split("/").pop();
      const dates = {
        "arctic-surfing": "2020-07-09",
        "san-diego-surf": "2020-07-09",
        "western-australia": "2020-07-09",
        "guide-la-skateparks": "2020-09-30",
        "ski-touring": "2020-09-30"
      };
      if (dates[slug]) meta["Publication Date"] = dates[slug];
    } else if (path.includes("/adventures/") && !path.endsWith("/adventures")) {
      meta.Template = "adventure";
      meta.Category = "Adventures";
    } else if (path.endsWith("/adventures") || path.endsWith("/adventures.html")) {
      meta.Template = "adventure-listing";
    } else if (path.endsWith("/magazine") || path.endsWith("/magazine.html")) {
      meta.Template = "magazine";
    } else if (path.endsWith("/faqs") || path.endsWith("/faqs.html")) {
      meta.Template = "faqs";
    } else if (path.endsWith("/about-us") || path.endsWith("/about-us.html")) {
      meta.Template = "about";
    } else if (path === "/us/en" || path === "/us/en.html" || path === "/us/en/" || mainstreamPath(path) === "/") {
      meta.Template = "home";
    }
    const block = WebImporter2.Blocks.getMetadataBlock(document, meta);
    return block;
  }
  function adventureCategoryMap(document) {
    const map = {};
    const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim());
    const panels = [...document.querySelectorAll('[role="tabpanel"]')];
    panels.forEach((panel, i) => {
      const cat = tabs[i];
      if (!cat || /^all$/i.test(cat)) return;
      panel.querySelectorAll('a[href*="/adventures/"]').forEach((a) => {
        var _a;
        const slug = (_a = (a.getAttribute("href") || "").match(/adventures\/([a-z0-9-]+)/)) == null ? void 0 : _a[1];
        if (!slug) return;
        (map[slug] = map[slug] || /* @__PURE__ */ new Set()).add(cat);
      });
    });
    return map;
  }
  function buildAdventureCards(document, main, url) {
    const base = new URL(url);
    const catMap = adventureCategoryMap(document);
    const seen = /* @__PURE__ */ new Set();
    const cards = [];
    main.querySelectorAll("article").forEach((art) => {
      var _a;
      const a = art.querySelector('a[href*="/adventures/"]');
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!/\/adventures\/[a-z0-9-]+(\.html)?$/i.test(href)) return;
      const slug = ((_a = href.match(/adventures\/([a-z0-9-]+)/)) == null ? void 0 : _a[1]) || "";
      const key = mainstreamPath(href.startsWith("http") ? new URL(href).pathname : href);
      if (seen.has(key)) return;
      const img = art.querySelector("img");
      const label = [...art.querySelectorAll("a")].map((x) => x.textContent.trim()).find(Boolean) || key.split("/").pop().replace(/-/g, " ");
      let desc = "";
      art.querySelectorAll("p, div, span").forEach((n) => {
        const t = n.textContent.trim();
        if (t && !n.querySelector("a, img") && t !== label && t.length > desc.length) desc = t;
      });
      if (!img && !label) return;
      seen.add(key);
      cards.push({
        href: key,
        img,
        label,
        desc,
        cats: [...catMap[slug] || []]
      });
    });
    if (cards.length === 0) return null;
    const rows = [["Cards"]];
    cards.forEach(({
      href,
      img,
      label,
      desc,
      cats
    }) => {
      const cell = document.createElement("div");
      if (img) {
        const im = document.createElement("img");
        im.src = /^https?:/.test(img.src) ? img.src : new URL(img.getAttribute("src"), base).href;
        im.alt = label;
        cell.append(im);
      }
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      p.append(link);
      cell.append(p);
      if (desc) {
        const dp = document.createElement("p");
        dp.textContent = desc;
        cell.append(dp);
      }
      if (cats.length) {
        const cp = document.createElement("p");
        cp.textContent = `categories: ${cats.join(", ")}`;
        cell.append(cp);
      }
      rows.push([cell]);
    });
    return rows;
  }
  function absSrc(imgEl, base) {
    const src = imgEl.getAttribute("src") || "";
    return /^https?:/.test(src) ? src : new URL(src, base).href;
  }
  function buildHomeCarousel(document, url) {
    const base = new URL(url);
    const slides = [...document.querySelectorAll(".cmp-carousel__item")];
    if (slides.length === 0) return null;
    const rows = [["Carousel"]];
    slides.forEach((slide) => {
      var _a, _b, _c, _d;
      const title = (_b = (_a = slide.querySelector(".cmp-teaser__title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
      const desc = (_d = (_c = slide.querySelector(".cmp-teaser__description")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim();
      const ctaEl = slide.querySelector(".cmp-teaser__action-link, a");
      const imgEl = slide.querySelector("img");
      if (!title || !imgEl) return;
      const imgCell = document.createElement("div");
      const im = document.createElement("img");
      im.src = absSrc(imgEl, base);
      im.alt = imgEl.getAttribute("alt") || title;
      imgCell.append(im);
      const content = document.createElement("div");
      const h = document.createElement("h2");
      h.textContent = title;
      content.append(h);
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc;
        content.append(p);
      }
      if (ctaEl) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        const href = ctaEl.getAttribute("href") || "/adventures";
        a.href = mainstreamPath(href.startsWith("http") ? new URL(href).pathname : href);
        a.textContent = ctaEl.textContent.trim() || "View Trips";
        p.append(a);
        content.append(p);
      }
      rows.push([imgCell, content]);
    });
    return rows.length > 1 ? rows : null;
  }
  function buildCardsFromArticles(document, listEl, base) {
    const items = [...listEl.querySelectorAll("article, li")].filter((el, i, arr) => (
      // keep leaf items: articles, or li that has a link+image
      el.tagName === "ARTICLE" || !arr.some((o) => o !== el && o.contains(el) && o.tagName === "ARTICLE")
    ));
    const seen = /* @__PURE__ */ new Set();
    const rows = [["Cards"]];
    (listEl.querySelectorAll("article").length ? listEl.querySelectorAll("article") : items).forEach((art) => {
      const link = art.querySelector("a[href]");
      const img = art.querySelector("img");
      if (!link || !img) return;
      const href = mainstreamPath(link.getAttribute("href") || "");
      if (seen.has(href)) return;
      seen.add(href);
      const title = [...art.querySelectorAll("a")].map((a) => a.textContent.trim()).find(Boolean) || "";
      let desc = "";
      art.querySelectorAll("p, div, span").forEach((n) => {
        const t = n.textContent.trim();
        if (t && !n.querySelector("a, img") && t !== title && t.length > desc.length) desc = t;
      });
      const cell = document.createElement("div");
      const im = document.createElement("img");
      im.src = absSrc(img, base);
      im.alt = title;
      cell.append(im);
      const tp = document.createElement("p");
      const ta = document.createElement("a");
      ta.href = href;
      ta.textContent = title;
      tp.append(ta);
      cell.append(tp);
      if (desc) {
        const dp = document.createElement("p");
        dp.textContent = desc;
        cell.append(dp);
      }
      rows.push([cell]);
    });
    return rows.length > 1 ? rows : null;
  }
  function buildFeaturedColumns(document, teaser, base, WebImporter2) {
    var _a, _b, _c, _d, _e, _f;
    const img = teaser.querySelector("img");
    const title = (_b = (_a = teaser.querySelector(".cmp-teaser__title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
    if (!img || !title) return null;
    const pre = (_d = (_c = teaser.querySelector(".cmp-teaser__pretitle")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim();
    const desc = (_f = (_e = teaser.querySelector(".cmp-teaser__description")) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim();
    const ctaEl = teaser.querySelector(".cmp-teaser__action-link, a");
    const text = document.createElement("div");
    if (pre) {
      const p = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = pre;
      p.append(em);
      text.append(p);
    }
    const h = document.createElement("h2");
    h.textContent = title;
    text.append(h);
    if (desc) {
      const p = document.createElement("p");
      p.textContent = desc;
      text.append(p);
    }
    if (ctaEl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      const href = ctaEl.getAttribute("href") || "/";
      a.href = mainstreamPath(href.startsWith("http") ? new URL(href).pathname : href);
      a.textContent = ctaEl.textContent.trim();
      p.append(a);
      text.append(p);
    }
    const imgCell = document.createElement("div");
    const im = document.createElement("img");
    im.src = absSrc(img, base);
    im.alt = img.getAttribute("alt") || title;
    imgCell.append(im);
    return WebImporter2.DOMUtils.createTable([["Columns (featured)"], [imgCell, text]], document);
  }
  function buildFeatureHero(document, teaser, base, WebImporter2) {
    var _a, _b, _c, _d;
    const img = teaser.querySelector("img");
    const title = (_b = (_a = teaser.querySelector(".cmp-teaser__title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
    if (!img || !title) return null;
    const desc = (_d = (_c = teaser.querySelector(".cmp-teaser__description")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim();
    const ctaEl = teaser.querySelector(".cmp-teaser__action-link, a");
    const imgCell = document.createElement("div");
    const im = document.createElement("img");
    im.src = absSrc(img, base);
    im.alt = img.getAttribute("alt") || title;
    imgCell.append(im);
    const content = document.createElement("div");
    const h = document.createElement("h2");
    h.textContent = title;
    content.append(h);
    if (desc) {
      const p = document.createElement("p");
      p.textContent = desc;
      content.append(p);
    }
    if (ctaEl) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      const href = ctaEl.getAttribute("href") || "/";
      a.href = mainstreamPath(href.startsWith("http") ? new URL(href).pathname : href);
      a.textContent = ctaEl.textContent.trim();
      p.append(a);
      content.append(p);
    }
    return WebImporter2.DOMUtils.createTable([["Hero"], [imgCell], [content]], document);
  }
  function buildFaqAccordion(document, root, WebImporter2) {
    const acc = root.querySelector('.cmp-accordion, [data-cmp-is="accordion"]');
    if (!acc) return null;
    const items = [...acc.querySelectorAll(".cmp-accordion__item")];
    if (items.length === 0) return null;
    const rows = [["Accordion"]];
    items.forEach((item) => {
      var _a, _b;
      const q = (_b = (_a = item.querySelector(".cmp-accordion__title, .cmp-accordion__header, button")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
      const panel = item.querySelector(".cmp-accordion__panel");
      if (!q) return;
      const qCell = document.createElement("div");
      const qp = document.createElement("p");
      qp.textContent = q;
      qCell.append(qp);
      const aCell = document.createElement("div");
      if (panel) {
        [...panel.childNodes].forEach((n) => aCell.append(n.cloneNode(true)));
      }
      rows.push([qCell, aCell]);
    });
    return rows.length > 1 ? WebImporter2.DOMUtils.createTable(rows, document) : null;
  }
  function extractProfileCards(document, base) {
    const seen = /* @__PURE__ */ new Set();
    const all = [];
    [...document.querySelectorAll(".experiencefragment, .cmp-experiencefragment")].forEach((xf) => {
      var _a, _b, _c, _d, _e, _f;
      const name = (_b = (_a = xf.querySelector("h3")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
      const role = (_d = (_c = xf.querySelector("h5")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim();
      const imgEl = xf.querySelector("img");
      if (!name || !imgEl) return;
      if (seen.has(name)) return;
      seen.add(name);
      let section = "";
      let node = xf;
      while (node) {
        let prev = node.previousElementSibling;
        while (prev) {
          const h2 = ((_e = prev.matches) == null ? void 0 : _e.call(prev, "h2")) ? prev : (_f = prev.querySelector) == null ? void 0 : _f.call(prev, "h2");
          if (h2) {
            section = h2.textContent.trim();
            break;
          }
          prev = prev.previousElementSibling;
        }
        if (section) break;
        node = node.parentElement;
      }
      const socials = [...xf.querySelectorAll("a[href]")].map((a) => {
        const label = (a.getAttribute("aria-label") || a.getAttribute("title") || "").trim();
        const platform = (label.split(/\s+/)[0] || "").toLowerCase();
        return { platform, href: a.getAttribute("href") || "#" };
      }).filter((s) => /facebook|twitter|instagram/.test(s.platform));
      all.push({
        name,
        role: role || "",
        img: absSrc(imgEl, base),
        socials,
        section: /guide/i.test(section) ? "guides" : "contributors"
      });
    });
    return {
      contributors: all.filter((c) => c.section === "contributors"),
      guides: all.filter((c) => c.section === "guides")
    };
  }
  function buildProfileCardsTable(document, people) {
    if (!people.length) return null;
    const rows = [["Cards (profile)"]];
    people.forEach(({
      name,
      role,
      img,
      socials
    }) => {
      const imgCell = document.createElement("div");
      const im = document.createElement("img");
      im.src = img;
      im.alt = name;
      imgCell.append(im);
      const body = document.createElement("div");
      const nameP = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = name;
      nameP.append(strong);
      body.append(nameP);
      if (role) {
        const roleP = document.createElement("p");
        roleP.textContent = role;
        body.append(roleP);
      }
      if (socials && socials.length) {
        const sp = document.createElement("p");
        socials.forEach((s) => {
          const a = document.createElement("a");
          a.href = s.href;
          a.textContent = s.platform;
          a.setAttribute("data-social", s.platform);
          sp.append(a);
        });
        body.append(sp);
      }
      rows.push([imgCell, body]);
    });
    return rows;
  }
  function extractArticleByline(document, base) {
    var _a, _b, _c, _d;
    const bio = document.querySelector(".cmp-byline");
    if (!bio) return null;
    const name = (_b = (_a = bio.querySelector(".cmp-byline__name")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
    const role = (_d = (_c = bio.querySelector(".cmp-byline__occupations")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim();
    const imgEl = bio.querySelector("img");
    if (!name) return null;
    let scope = bio;
    for (let i = 0; i < 3; i += 1) {
      if (scope.parentElement && scope.parentElement.querySelector("a[href]")) {
        scope = scope.parentElement;
        break;
      }
      if (scope.parentElement) scope = scope.parentElement;
    }
    const socials = [...scope.querySelectorAll("a[href]")].map((a) => {
      const label = (a.getAttribute("aria-label") || a.getAttribute("title") || a.textContent || "").trim();
      const platform = (label.split(/\s+/)[0] || "").toLowerCase();
      return { platform, href: a.getAttribute("href") || "#" };
    }).filter((s) => /facebook|twitter|instagram/.test(s.platform));
    return {
      name,
      role: role || "",
      img: imgEl ? absSrc(imgEl, base) : "",
      socials
    };
  }
  function buildAuthorBioTable(document, byline) {
    if (!byline) return null;
    const imgCell = document.createElement("div");
    if (byline.img) {
      const im = document.createElement("img");
      im.src = byline.img;
      im.alt = byline.name;
      imgCell.append(im);
    }
    const body = document.createElement("div");
    const nameP = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = byline.name;
    nameP.append(strong);
    body.append(nameP);
    if (byline.role) {
      const roleP = document.createElement("p");
      roleP.textContent = byline.role;
      body.append(roleP);
    }
    if (byline.socials && byline.socials.length) {
      const sp = document.createElement("p");
      byline.socials.forEach((s) => {
        const a = document.createElement("a");
        a.href = s.href;
        a.textContent = s.platform;
        sp.append(a);
      });
      body.append(sp);
    }
    return [["Author Bio"], [imgCell, body]];
  }
  function extractAdventure(document, base) {
    const dl = document.querySelector("dl.cmp-contentfragment__elements, dl");
    if (!dl) return null;
    const heroImgs = [...document.querySelectorAll(".cmp-carousel__item img")].map((img) => absSrc(img, base));
    const details = [...dl.querySelectorAll(".cmp-contentfragment__element, div")].map((el) => {
      const dt = el.querySelector("dt");
      const dd = el.querySelector("dd");
      if (!dt || !dd) return null;
      return { label: dt.textContent.trim(), value: dd.textContent.trim() };
    }).filter(Boolean);
    const tablist = [...document.querySelectorAll('[role="tablist"]')].find((t) => [...t.querySelectorAll('[role="tab"]')].some((x) => /overview/i.test(x.textContent)));
    const tabs = [];
    if (tablist) {
      [...tablist.querySelectorAll('[role="tab"]')].forEach((tab) => {
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) tabs.push({ label: tab.textContent.trim(), panel: panel.cloneNode(true) });
      });
    }
    return { heroImgs, details, tabs };
  }
  function buildAdventureCarousel(document, imgs) {
    if (!imgs.length) return null;
    const rows = [["Carousel"]];
    imgs.forEach((src) => {
      const cell = document.createElement("div");
      const im = document.createElement("img");
      im.src = src;
      cell.append(im);
      rows.push([cell]);
    });
    return rows;
  }
  function buildAdventureDetails(document, details) {
    if (!details.length) return null;
    const rows = [["Adventure Details"]];
    details.forEach(({ label, value }) => {
      const labelCell = document.createElement("div");
      const lp = document.createElement("p");
      lp.textContent = label;
      labelCell.append(lp);
      const valueCell = document.createElement("div");
      const vp = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = value;
      vp.append(strong);
      valueCell.append(vp);
      rows.push([labelCell, valueCell]);
    });
    return rows;
  }
  function buildAdventureTabs(document, tabs, base, title) {
    if (!tabs.length) return null;
    const rows = [["Tabs"]];
    tabs.forEach(({ label, panel }) => {
      const content = document.createElement("div");
      const source = panel.querySelector(".cmp-contentfragment__content, article") || panel;
      [...source.children].forEach((child) => content.append(child.cloneNode(true)));
      content.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !/^https?:/i.test(src) && !src.startsWith("data:")) {
          try {
            img.src = new URL(src, base).href;
          } catch (e) {
          }
        }
      });
      content.querySelectorAll("h1, h2, h3").forEach((h) => {
        if (title && h.textContent.trim().toLowerCase() === title.toLowerCase()) h.remove();
      });
      content.querySelectorAll("p").forEach((p) => {
        if (!p.textContent.trim() && !p.querySelector("img, picture")) p.remove();
      });
      const labelCell = document.createElement("div");
      labelCell.textContent = label;
      rows.push([labelCell, content]);
    });
    return rows;
  }
  var import_default = {
    transformDOM: ({ document, url }) => {
      var _a;
      const main = pickMain(document);
      const path = new URL(url).pathname;
      const isAbout = path.endsWith("/about-us") || path.endsWith("/about-us.html");
      const profiles = isAbout ? extractProfileCards(document, new URL(url)) : null;
      const isArticle = path.includes("/magazine/") && !path.endsWith("/magazine") && !path.endsWith("/magazine.html");
      const byline = isArticle ? extractArticleByline(document, new URL(url)) : null;
      const isAdventure = path.includes("/adventures/") && !path.endsWith("/adventures") && !path.endsWith("/adventures.html");
      const adventure = isAdventure ? extractAdventure(document, new URL(url)) : null;
      stripChrome(main, WebImporter);
      absolutizeImages(main, url);
      fixLinks(main);
      const h1 = main.querySelector("h1");
      if (h1) {
        const h1text = h1.textContent.trim().toLowerCase();
        main.querySelectorAll("h2, h3").forEach((h) => {
          if (h.textContent.trim().toLowerCase() === h1text) h.remove();
        });
      }
      const appended = [];
      const isHome = path === "/us/en" || path === "/us/en.html" || path === "/us/en/" || mainstreamPath(path) === "/";
      if (isHome) {
        const base = new URL(url);
        const carouselRows = buildHomeCarousel(document, url);
        const featuredTeasers = [...main.querySelectorAll(".cmp-teaser")].filter((t) => !t.closest(".cmp-carousel") && t.querySelector("img"));
        featuredTeasers.forEach((teaser) => {
          var _a2, _b;
          const hasPretitle = !!((_b = (_a2 = teaser.querySelector(".cmp-teaser__pretitle")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b.trim());
          const table = hasPretitle ? buildFeaturedColumns(document, teaser, base, WebImporter) : buildFeatureHero(document, teaser, base, WebImporter);
          if (table) teaser.replaceWith(table);
        });
        const articleLists = [...main.querySelectorAll("ul")].filter((ul) => ul.querySelector("article"));
        articleLists.forEach((ul) => {
          const cardRows = buildCardsFromArticles(document, ul, base);
          if (cardRows) {
            const table = WebImporter.DOMUtils.createTable(cardRows, document);
            ul.replaceWith(table);
          }
        });
        WebImporter.DOMUtils.remove(main, [".cmp-carousel", ".carousel"]);
        if (carouselRows) {
          const carouselTable = WebImporter.DOMUtils.createTable(carouselRows, document);
          main.prepend(carouselTable);
        }
      }
      if (path.endsWith("/adventures") || path.endsWith("/adventures.html")) {
        const base = new URL(url);
        const rows = buildAdventureCards(document, main, url);
        const intro = [...main.querySelectorAll(".cmp-teaser")].find((t) => t.querySelector("img") && !t.closest('[role="tabpanel"]'));
        if (intro) {
          const heroTable = buildFeatureHero(document, intro, base, WebImporter);
          if (heroTable) intro.replaceWith(heroTable);
          else intro.remove();
        }
        main.querySelectorAll("ol").forEach((ol) => {
          if (/climbing|cycling|skiing|surfing|travel/i.test(ol.textContent)) ol.remove();
        });
        main.querySelectorAll("ul").forEach((ul) => {
          if (ul.querySelector('a[href*="/adventures/"], article')) ul.remove();
        });
        if (rows) {
          const table = WebImporter.DOMUtils.createTable(rows, document);
          appended.push(table);
        }
      }
      if (path.endsWith("/magazine") || path.endsWith("/magazine.html")) {
        const base = new URL(url);
        [...main.querySelectorAll(".cmp-teaser")].forEach((teaser) => {
          var _a2, _b;
          if (!teaser.querySelector("img")) return;
          const hasPretitle = !!((_b = (_a2 = teaser.querySelector(".cmp-teaser__pretitle")) == null ? void 0 : _a2.textContent) == null ? void 0 : _b.trim());
          if (hasPretitle) {
            const table2 = buildFeaturedColumns(document, teaser, base, WebImporter);
            if (table2) teaser.replaceWith(table2);
            else teaser.remove();
          } else {
            teaser.remove();
          }
        });
        main.querySelectorAll("ul").forEach((ul) => {
          if (ul.querySelector("a")) ul.remove();
        });
        main.querySelectorAll("h2, h3, p, hr").forEach((el) => {
          if (el.closest("table")) return;
          const t = el.textContent.trim().toLowerCase();
          if (["all articles", "members only", "featured article"].includes(t)) el.remove();
          if (/^sign in to un-?lock/i.test(el.textContent.trim())) el.remove();
        });
        const heading = document.createElement("h2");
        heading.textContent = "All Articles";
        appended.push(heading);
        const rows = [
          ["Article List"],
          ["category", "Magazine"],
          ["template", "article"]
        ];
        const table = WebImporter.DOMUtils.createTable(rows, document);
        appended.push(table);
      }
      if (path.endsWith("/faqs") || path.endsWith("/faqs.html")) {
        const acc = main.querySelector('.cmp-accordion, [data-cmp-is="accordion"]');
        if (acc) {
          const table = buildFaqAccordion(document, main, WebImporter);
          if (table) acc.replaceWith(table);
          else acc.remove();
        }
        const help = [...main.querySelectorAll("h2, h3")].find((h) => /need more help/i.test(h.textContent));
        if (help) help.before(document.createElement("hr"));
      }
      if (isAbout && profiles) {
        const insertAfterHeading = (matcher, introRe, people) => {
          const heading = [...main.querySelectorAll("h2")].find((h) => matcher.test(h.textContent));
          const rows = buildProfileCardsTable(document, people);
          if (!heading || !rows) return;
          const table = WebImporter.DOMUtils.createTable(rows, document);
          const intro = [...main.querySelectorAll("p")].find((p) => introRe.test(p.textContent));
          (intro || heading).after(table);
        };
        insertAfterHeading(/our contributors/i, /most compelling stories/i, profiles.contributors);
        insertAfterHeading(/wknd guides/i, /extraordinary travel guides/i, profiles.guides);
      }
      if (isArticle) {
        const h1el = main.querySelector("h1");
        const bylineH = [...main.querySelectorAll("h2, h3, h4, h5, h6")].find((h) => /^By\s+.+/i.test(h.textContent.trim()) && h.textContent.trim().length < 60);
        if (bylineH) {
          const p = document.createElement("p");
          p.className = "byline";
          p.textContent = bylineH.textContent.trim();
          bylineH.replaceWith(p);
        }
        if (h1el) {
          const slug = mainstreamPath(path).split("/").pop() || "";
          const pageName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          const eyebrow = document.createElement("p");
          const magLink = document.createElement("a");
          magLink.href = "/magazine";
          magLink.textContent = "Magazine";
          eyebrow.append(magLink);
          if (pageName) eyebrow.append(document.createTextNode(` / ${pageName}`));
          h1el.before(eyebrow);
        }
        const heroPic = main.querySelector("picture, img");
        const heroP = heroPic ? heroPic.closest("p") || heroPic.parentElement : null;
        if (heroP) heroP.after(document.createElement("hr"));
        const bioRows = buildAuthorBioTable(document, byline);
        if (bioRows) appended.push(WebImporter.DOMUtils.createTable(bioRows, document));
        appended.push(document.createElement("hr"));
        const shareHeading = document.createElement("h5");
        shareHeading.textContent = "Share this Story";
        appended.push(shareHeading);
        const listRows = [
          ["Article List (compact)"],
          ["category", "Magazine"],
          ["template", "article"]
        ];
        appended.push(WebImporter.DOMUtils.createTable(listRows, document));
      }
      if (isAdventure && adventure) {
        const base = new URL(url);
        const title = (((_a = main.querySelector("h1")) == null ? void 0 : _a.textContent) || "").trim();
        main.textContent = "";
        const carRows = buildAdventureCarousel(document, adventure.heroImgs);
        if (carRows) main.append(WebImporter.DOMUtils.createTable(carRows, document));
        main.append(document.createElement("hr"));
        const slug = mainstreamPath(path).split("/").pop() || "";
        const pageName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const eyebrow = document.createElement("p");
        const advLink = document.createElement("a");
        advLink.href = "/adventures";
        advLink.textContent = "Adventures";
        eyebrow.append(advLink);
        eyebrow.append(document.createTextNode(` / ${pageName}`));
        main.append(eyebrow);
        const h1new = document.createElement("h1");
        h1new.textContent = title || pageName;
        main.append(h1new);
        main.append(document.createElement("hr"));
        const detailRows = buildAdventureDetails(document, adventure.details);
        if (detailRows) main.append(WebImporter.DOMUtils.createTable(detailRows, document));
        const shareH = document.createElement("h5");
        shareH.textContent = "Share this Adventure";
        main.append(shareH);
        main.append(document.createElement("hr"));
        const tabRows = buildAdventureTabs(document, adventure.tabs, base, title);
        if (tabRows) main.append(WebImporter.DOMUtils.createTable(tabRows, document));
        appended.length = 0;
      }
      const metaBlock = buildMetadata(document, url, main, WebImporter);
      if (metaBlock) appended.push(metaBlock);
      appended.forEach((el) => main.append(el));
      main.querySelectorAll("a.cmp-button, .button > a[href], a.cmp-teaser__action-link").forEach((a) => {
        if (a.closest("table")) return;
        if (a.querySelector("img")) return;
        if (a.closest("strong")) return;
        const text = a.textContent.trim();
        if (!text) return;
        const strong = document.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
      });
      return main;
    },
    generateDocumentPath: ({ url }) => {
      const p = mainstreamPath(new URL(url).pathname);
      const target = p === "/" ? "/index" : p;
      return WebImporter.FileUtils.sanitizePath(target);
    }
  };
  return __toCommonJS(import_exports);
})();

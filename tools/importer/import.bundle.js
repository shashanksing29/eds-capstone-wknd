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
    } else if (path.includes("/adventures/") && !path.endsWith("/adventures")) {
      meta.Template = "adventure";
      meta.Category = "Adventures";
    } else if (path.endsWith("/adventures") || path.endsWith("/adventures.html")) {
      meta.Template = "adventure-listing";
    } else if (path.endsWith("/magazine") || path.endsWith("/magazine.html")) {
      meta.Template = "magazine";
    }
    const block = WebImporter2.Blocks.getMetadataBlock(document, meta);
    return block;
  }
  function buildAdventureCards(document, main, url) {
    const base = new URL(url);
    const seen = /* @__PURE__ */ new Set();
    const cards = [];
    main.querySelectorAll("a[href]").forEach((a) => {
      var _a, _b;
      const href = a.getAttribute("href") || "";
      if (!/\/adventures\/[a-z0-9-]+(\.html)?$/i.test(href)) return;
      const key = mainstreamPath(href.startsWith("http") ? new URL(href).pathname : href);
      if (seen.has(key)) return;
      const scope = a.closest("li, article, .cmp-teaser, div") || a;
      const img = scope.querySelector("img");
      const label = a.textContent.trim() || ((_b = (_a = scope.querySelector(".cmp-teaser__title, h2, h3")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || key.split("/").pop().replace(/-/g, " ");
      if (!img && !label) return;
      seen.add(key);
      cards.push({ href: key, img, label });
    });
    if (cards.length === 0) return null;
    const rows = [["Cards"]];
    cards.forEach(({ href, img, label }) => {
      const cell = document.createElement("div");
      if (img) {
        const im = document.createElement("img");
        im.src = /^https?:/.test(img.src) ? img.src : new URL(img.getAttribute("src"), base).href;
        cell.append(im);
      }
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      p.append(link);
      cell.append(p);
      rows.push([cell]);
    });
    return rows;
  }
  function buildHomeHero(document, url) {
    var _a, _b, _c, _d;
    const base = new URL(url);
    const teaser = document.querySelector(".cmp-carousel .cmp-teaser, .carousel .cmp-teaser, .cmp-teaser");
    if (!teaser) return null;
    const title = (_b = (_a = teaser.querySelector(".cmp-teaser__title")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim();
    const desc = (_d = (_c = teaser.querySelector(".cmp-teaser__description")) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim();
    const ctaEl = teaser.querySelector(".cmp-teaser__action-link, a");
    const imgEl = teaser.querySelector("img");
    if (!title || !imgEl) return null;
    const content = document.createElement("div");
    const h1 = document.createElement("h1");
    h1.textContent = title;
    content.append(h1);
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
      const strong = document.createElement("strong");
      strong.append(a);
      p.append(strong);
      content.append(p);
    }
    const imgCell = document.createElement("div");
    const im = document.createElement("img");
    const src = imgEl.getAttribute("src") || "";
    im.src = /^https?:/.test(src) ? src : new URL(src, base).href;
    im.alt = imgEl.getAttribute("alt") || title;
    imgCell.append(im);
    return [["Hero"], [imgCell], [content]];
  }
  var import_default = {
    transformDOM: ({ document, url }) => {
      const main = pickMain(document);
      const path = new URL(url).pathname;
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
        const heroRows = buildHomeHero(document, url);
        if (heroRows) {
          const heroTable = WebImporter.DOMUtils.createTable(heroRows, document);
          main.prepend(heroTable);
        }
      }
      if (path.endsWith("/adventures") || path.endsWith("/adventures.html")) {
        const rows = buildAdventureCards(document, main, url);
        if (rows) {
          const table = WebImporter.DOMUtils.createTable(rows, document);
          appended.push(table);
        }
      }
      if (path.endsWith("/magazine") || path.endsWith("/magazine.html")) {
        main.querySelectorAll("ul").forEach((ul) => {
          if (ul.querySelector("a")) ul.remove();
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
      const metaBlock = buildMetadata(document, url, main, WebImporter);
      if (metaBlock) appended.push(metaBlock);
      appended.forEach((el) => main.append(el));
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

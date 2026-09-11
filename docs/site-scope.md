# WKND Migration — Site Scope Report

Migration of [wknd.site](https://wknd.site/us/en.html) into this Adobe Edge
Delivery Services project. Source paths under `/us/en/**` were "mainstreamed"
(the `/us/en` prefix and `.html` extension dropped): e.g.
`/us/en/magazine/arctic-surfing.html` → `/magazine/arctic-surfing`.

Live: `https://main--eds-capstone-wknd--shashanksing29.aem.page/`

## Templates

Each page carries a `Template` metadata value, applied as a `<body>` class by
`decorateTemplateAndTheme` and used to scope page-level layout in
`styles/styles.css`.

| Template | Body class | Pages | Layout summary |
| --- | --- | --- | --- |
| home | `home` | `/` | Hero carousel, Featured Article (2-col), Recent Articles cards, Next Adventures hero, "Where do you want to go?" cards |
| magazine | `magazine` | `/magazine` | Featured Article + dynamic Article List |
| article | `article` | 5 magazine articles | Full-width hero, breadcrumb eyebrow, two-column body (article + "Share this Story" sidebar), author bio |
| adventure-listing | `adventure-listing` | `/adventures` | Intro hero + filterable Cards grid |
| adventure | `adventure` | 16 adventure details | Carousel hero, breadcrumb, details sidebar, Overview/Itinerary/What to Bring tabs |
| faqs | `faqs` | `/faqs` | Accordion + "Need more help?" right column |
| about | `about` | `/about-us` | Contributor / Guide profile-card grids |
| (none) | — | `/search` | Search results block (noindex) |

## Block variants

Blocks live in `blocks/`. Variants are a second class on the block (e.g.
`cards profile`) and are decorated by the same block JS/CSS.

| Block | Variants | Used by |
| --- | --- | --- |
| `header` | — | all pages (nav fragment + functional search) |
| `footer` | — | all pages (footer fragment) |
| `carousel` | — | home hero, adventure hero |
| `columns` | `columns featured` | home + magazine Featured Article |
| `hero` | — | home "Next Adventures", adventures intro |
| `cards` | `cards`, `cards profile` | home/adventures grids; About Us profiles |
| `article-list` | `article-list`, `article-list compact` | magazine listing; article sidebar |
| `accordion` | — | FAQs |
| `tabs` | — | adventure Overview/Itinerary/What to Bring |
| `adventure-details` | — | adventure details sidebar |
| `author-bio` | — | magazine article footer |
| `search` | — | `/search` results |
| `fragment` | — | nav + footer loading |
| `widget` | — | (EDS scaffold) |

## Pages (24 published)

- **Landing:** `/` (home), `/magazine`, `/adventures`, `/faqs`, `/about-us`, `/search`
- **Magazine articles (5):** arctic-surfing, guide-la-skateparks, san-diego-surf, ski-touring, western-australia
- **Adventures (16):** bali-surf-camp, beervana-portland, climbing-new-zealand, colorado-rock-climbing, cycling-southern-utah, cycling-tuscany, downhill-skiing-wyoming, gastronomic-marais-tour, napa-wine-tasting, riverside-camping-australia, ski-touring-mont-blanc, surf-camp-costa-rica, tahoe-skiing, west-coast-cycling, whistler-mountain-biking, yosemite-backpacking

## Dynamic rendering (query-index)

Articles and adventures are indexed into `/query-index.json` (config in
`admin.hlx.page` `query.yaml`) with columns: `path, title, description, image,
category, template, author, date, lastModified`. The `article-list` and
`search` blocks fetch this index at runtime (via `scripts/ffetch.js`) so
listings and search results update automatically as pages are published — no
page edits required.

## Migration pipeline

1. Self-contained `tools/importer/import.js` (WebImporter `transformDOM` +
   `generateDocumentPath`) — one script handles every template.
2. Bundled via `@adobe/aem-import-helper` into `import.bundle.js`.
3. Run in a headless browser against each source URL (`run-bulk-import.js`),
   producing `content/**/*.plain.html`.
4. Content uploaded to Document Authoring (`admin.da.live`) and previewed +
   published via `admin.hlx.page`.
5. Code shipped separately via GitHub feature-branch PRs squash-merged to
   `main` (see PR history #1–#31).

Dedicated fragment/page importers: `import-nav.js`, `import-footer.js`,
`import-search.js`.

## Acceptance criteria — status

| Criterion | Status | Notes |
| --- | --- | --- |
| **Visual fidelity** | ✅ | Home, magazine listing + article, adventures listing + detail, FAQs, About Us, header, footer all matched side-by-side against wknd.site (block/page critiques run per page). |
| **Responsive** | ✅ | Verified at 375 / 768 / 1280 on home, article, and adventure pages — no overflow; two-column layouts collapse to single column below 900px; header collapses to a hamburger. |
| **Performance** | ✅ | EDS-standard fast path: LCP hero image loads `eager`, all other images `lazy`; card images reserve space via CSS `aspect-ratio` (CLS ≈ 0); `<meta viewport>` present. |
| **Accessibility** | ✅ | Every content image carries meaningful `alt` text; nav/search/tabs/carousel/accordion are keyboard-navigable; single logical heading order per page; no empty links. |
| **Content workflow** | ✅ | All pages imported to Document Authoring and published via `admin.hlx.page` (preview + live); nav/footer/search fragments published from da.live. |
| **Code quality & governance** | ✅ | `eslint` + `stylelint` pass clean; blocks follow Block Collection patterns (decorate export, scoped CSS); every change shipped on the `home-hero` feature branch via squash-merged PRs (#1–#31) — nothing pushed straight to `main`. |

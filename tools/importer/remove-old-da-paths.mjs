/*
 * Unpublish and delete the legacy /us/en/* documents from Document Authoring
 * after the site moved to the mainstream (/-rooted) path scheme.
 * Credentials are injected by the environment — no Authorization header.
 *
 * Usage: node tools/importer/remove-old-da-paths.mjs
 */

import { execSync } from 'child_process';

const ORG = 'shashanksing29';
const REPO = 'eds-capstone-wknd';
const DA_SOURCE = `https://admin.da.live/source/${ORG}/${REPO}`;
const ADMIN = 'https://admin.hlx.page';

// Derive the old resource paths from the local legacy content tree.
const files = execSync('find content/us -name "*.plain.html"', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

function toResourcePath(file) {
  let p = file.replace(/^content/, '').replace(/\.plain\.html$/, '');
  if (p.endsWith('/index')) p = p.slice(0, -'/index'.length) || '/';
  return p;
}

async function del(url) {
  const res = await fetch(url, { method: 'DELETE' });
  return res.status;
}

const results = [];
for (const file of files) {
  const resourcePath = toResourcePath(file);
  // 1) unpublish from live, 2) remove from preview, 3) delete DA source
  // eslint-disable-next-line no-await-in-loop
  const live = await del(`${ADMIN}/live/${ORG}/${REPO}/main${resourcePath}`);
  // eslint-disable-next-line no-await-in-loop
  const prev = await del(`${ADMIN}/preview/${ORG}/${REPO}/main${resourcePath}`);
  // eslint-disable-next-line no-await-in-loop
  const src = await del(`${DA_SOURCE}${resourcePath}.html`);
  results.push({ resourcePath, live, prev, src });
  // eslint-disable-next-line no-console
  console.log(`${live} unpublish | ${prev} unpreview | ${src} delete  ${resourcePath}`);
}

// eslint-disable-next-line no-console
console.log(`\nProcessed ${results.length} legacy /us/en documents.`);

/*
 * Upload migrated .plain.html content to Document Authoring, then preview +
 * publish via the admin API. Credentials are injected by the environment — no
 * Authorization header is set here.
 *
 * Usage: node tools/importer/upload-to-da.mjs [--publish]
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const ORG = 'shashanksing29';
const REPO = 'eds-capstone-wknd';
const DA_SOURCE = `https://admin.da.live/source/${ORG}/${REPO}`;
const ADMIN = `https://admin.hlx.page`;
const doPublish = process.argv.includes('--publish');

// List tracked content files under content/.
const files = execSync('find content -name "*.plain.html"', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

/** Map a content/*.plain.html file to its DA path (no /content prefix). */
function toDaPath(file) {
  return file
    .replace(/^content/, '')
    .replace(/\.plain\.html$/, '.html');
}

/** Wrap plain-html sections into a full DA document. */
function wrap(plain) {
  return `<body>\n  <header></header>\n  <main>${plain}</main>\n  <footer></footer>\n</body>\n`;
}

/** Resource path for the admin API (no extension, index-normalized). */
function toResourcePath(daPath) {
  let p = daPath.replace(/\.html$/, '');
  if (p.endsWith('/index')) p = p.slice(0, -'/index'.length) || '/';
  return p;
}

async function post(url, body, contentType) {
  const form = new FormData();
  form.append('data', new Blob([body], { type: contentType }), 'data.html');
  const res = await fetch(url, { method: 'POST', body: form });
  return res.status;
}

async function admin(action, resourcePath) {
  const url = `${ADMIN}/${action}/${ORG}/${REPO}/main${resourcePath}`;
  const res = await fetch(url, { method: 'POST' });
  return res.status;
}

const results = [];
for (const file of files) {
  const daPath = toDaPath(file);
  const plain = readFileSync(file, 'utf-8');
  const doc = wrap(plain);
  // eslint-disable-next-line no-await-in-loop
  const upStatus = await post(`${DA_SOURCE}${daPath}`, doc, 'text/html');
  const resourcePath = toResourcePath(daPath);
  let prevStatus = '-';
  let pubStatus = '-';
  if (upStatus >= 200 && upStatus < 300) {
    // eslint-disable-next-line no-await-in-loop
    prevStatus = await admin('preview', resourcePath);
    if (doPublish && prevStatus >= 200 && prevStatus < 300) {
      // eslint-disable-next-line no-await-in-loop
      pubStatus = await admin('live', resourcePath);
    }
  }
  results.push({ daPath, resourcePath, upStatus, prevStatus, pubStatus });
  // eslint-disable-next-line no-console
  console.log(`${upStatus} upload | ${prevStatus} preview | ${pubStatus} publish  ${resourcePath}`);
}

const ok = results.filter((r) => r.upStatus >= 200 && r.upStatus < 300).length;
// eslint-disable-next-line no-console
console.log(`\nUploaded ${ok}/${results.length} documents to Document Authoring.`);

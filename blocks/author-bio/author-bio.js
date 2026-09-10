import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Author Bio — the byline footer at the end of a magazine article.
 * Authored as one row: [photo] | [name + role + social links]. Renders a round
 * photo on the left and a name/role/social bar on the right, matching WKND.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const imgCell = cells[0];
  const body = cells[1];

  if (imgCell) {
    imgCell.className = 'author-bio-image';
    const img = imgCell.querySelector('img');
    if (img) {
      imgCell.replaceChildren(
        createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]),
      );
    }
  }

  if (body) {
    body.className = 'author-bio-body';
    // the social paragraph: links whose text is a known network → icon bar
    const socialP = [...body.querySelectorAll('p')].find((p) => {
      const links = [...p.querySelectorAll('a')];
      return links.length > 0 && links.every((a) => /^(facebook|twitter|instagram)$/i.test(a.textContent.trim()));
    });
    if (socialP) {
      socialP.classList.add('author-bio-social');
      socialP.querySelectorAll('a').forEach((a) => {
        const network = a.textContent.trim().toLowerCase();
        a.setAttribute('aria-label', network);
        a.textContent = '';
        a.classList.add('author-bio-social-icon', `author-bio-social-${network}`);
      });
    }
  }

  block.replaceChildren(...[imgCell, body].filter(Boolean));
}

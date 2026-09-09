/*
 * Hero block — full-bleed background image with an overlaid content panel
 * (title, description, CTA button). Matches the WKND home hero.
 *
 * Authored structure (two rows):
 *   row 1: the background image
 *   row 2: heading + text + button
 */
export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cell = row.children[0];
    if (cell && cell.querySelector('picture, img')) {
      row.className = 'hero-image';
    } else {
      row.className = 'hero-content';
    }
  });
}

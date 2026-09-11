export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Featured variant: a generic "Read More" CTA gets a descriptive accessible
  // name from the block's heading (keeps the visible label, fixes link-text
  // and WCAG 2.5.3 without an aria-label that mismatches visible text).
  if (block.classList.contains('featured')) {
    const heading = block.querySelector('h2, h3');
    block.querySelectorAll('a').forEach((a) => {
      const label = a.textContent.trim();
      if (heading && /^(read more|full article|learn more|see more)$/i.test(label)) {
        a.setAttribute('aria-label', `${label}: ${heading.textContent.trim()}`);
      }
    });
  }
}

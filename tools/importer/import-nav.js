/*
 * Import for the WKND nav content fragment (/nav).
 * The header block loads this via loadFragment() and expects 3 top-level
 * sections: brand, sections (primary nav), tools. Sections are separated by
 * <hr> so they survive markdown conversion as distinct top-level divs.
 */

const NAV_LINKS = [
  ['Magazine', '/magazine'],
  ['Adventures', '/adventures'],
  ['FAQs', '/faqs'],
  ['About Us', '/about-us'],
];

export default {
  transformDOM: ({ document }) => {
    const container = document.createElement('div');

    // Section 1: brand
    const brandP = document.createElement('p');
    const brandLink = document.createElement('a');
    brandLink.href = '/';
    brandLink.textContent = 'WKND';
    brandP.append(brandLink);
    container.append(brandP);

    container.append(document.createElement('hr'));

    // Section 2: primary nav
    const ul = document.createElement('ul');
    NAV_LINKS.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      ul.append(li);
    });
    container.append(ul);

    container.append(document.createElement('hr'));

    // Section 3: tools
    const toolsP = document.createElement('p');
    toolsP.textContent = 'Search';
    container.append(toolsP);

    return container;
  },
  generateDocumentPath: () => '/nav',
};

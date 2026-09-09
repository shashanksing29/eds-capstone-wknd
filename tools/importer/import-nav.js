/*
 * Import for the WKND nav content fragment (/nav).
 * The header block loads this via loadFragment() and expects 3 top-level
 * sections: brand, sections (primary nav), tools.
 */

const NAV_LINKS = [
  ['Home', '/'],
  ['Magazine', '/magazine'],
  ['Adventures', '/adventures'],
  ['FAQs', '/faqs'],
  ['About Us', '/about-us'],
];

export default {
  transformDOM: ({ document }) => {
    const container = document.createElement('div');

    // Section 1: brand
    const brand = document.createElement('div');
    const brandP = document.createElement('p');
    const brandLink = document.createElement('a');
    brandLink.href = '/';
    brandLink.textContent = 'WKND';
    brandP.append(brandLink);
    brand.append(brandP);
    container.append(brand);

    // Section 2: primary nav
    const sections = document.createElement('div');
    const ul = document.createElement('ul');
    NAV_LINKS.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      ul.append(li);
    });
    sections.append(ul);
    container.append(sections);

    // Section 3: tools
    const tools = document.createElement('div');
    const toolsP = document.createElement('p');
    toolsP.textContent = 'Search';
    tools.append(toolsP);
    container.append(tools);

    return container;
  },
  generateDocumentPath: () => '/nav',
};

/*
 * Import for the WKND footer content fragment (/footer).
 * The footer block loads this via loadFragment().
 */

const NAV_LINKS = [
  ['Home', '/'],
  ['Magazine', '/magazine'],
  ['Adventures', '/adventures'],
  ['FAQs', '/faqs'],
  ['About Us', '/about-us'],
];

const SOCIAL = [['Facebook', '#'], ['Twitter', '#'], ['Instagram', '#']];

export default {
  transformDOM: ({ document }) => {
    const container = document.createElement('div');

    // Column 1: WKND wordmark
    const brand = document.createElement('p');
    const brandLink = document.createElement('a');
    brandLink.href = '/';
    brandLink.textContent = 'WKND';
    brand.append(brandLink);
    container.append(brand);

    container.append(document.createElement('hr'));

    // Column 2: primary nav
    const navUl = document.createElement('ul');
    NAV_LINKS.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      navUl.append(li);
    });
    container.append(navUl);

    container.append(document.createElement('hr'));

    // Column 2: social
    const h = document.createElement('h4');
    h.textContent = 'Follow Us';
    container.append(h);
    const socialUl = document.createElement('ul');
    SOCIAL.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      socialUl.append(li);
    });
    container.append(socialUl);

    container.append(document.createElement('hr'));

    // Column 3: legal
    const p = document.createElement('p');
    p.textContent = 'Ⓒ 2024, WKND Site. WKND is a fictitious adventure and travel website '
      + 'created by Adobe to demonstrate how anyone can use Adobe Experience Manager '
      + 'to build a beautiful, feature-rich website.';
    container.append(p);

    return container;
  },
  generateDocumentPath: () => '/footer',
};

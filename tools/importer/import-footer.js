/*
 * Import for the WKND footer content fragment (/footer).
 * The footer block loads this via loadFragment().
 */

const NAV_LINKS = [
  ['Home', '/us/en/index'],
  ['Magazine', '/us/en/magazine'],
  ['Adventures', '/us/en/adventures'],
  ['FAQs', '/us/en/faqs'],
  ['About Us', '/us/en/about-us'],
];

const SOCIAL = [['Facebook', '#'], ['Twitter', '#'], ['Instagram', '#']];

export default {
  transformDOM: ({ document }) => {
    const container = document.createElement('div');

    const nav = document.createElement('div');
    const navUl = document.createElement('ul');
    NAV_LINKS.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      navUl.append(li);
    });
    nav.append(navUl);
    container.append(nav);

    const follow = document.createElement('div');
    const h = document.createElement('h4');
    h.textContent = 'Follow Us';
    follow.append(h);
    const socialUl = document.createElement('ul');
    SOCIAL.forEach(([label, href]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
      socialUl.append(li);
    });
    follow.append(socialUl);
    container.append(follow);

    const legal = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = 'Ⓒ 2024, WKND Site. WKND is a fictitious adventure and travel website '
      + 'created by Adobe to demonstrate how anyone can use Adobe Experience Manager '
      + 'to build a beautiful, feature-rich website.';
    legal.append(p);
    container.append(legal);

    return container;
  },
  generateDocumentPath: () => '/footer',
};

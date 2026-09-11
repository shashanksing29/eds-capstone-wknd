/*
 * Tabs block — a tab bar with one panel per row. Authored as two-cell rows:
 * [label, panel content]. Matches the WKND adventure Overview / Itinerary /
 * What to Bring tabs. The first tab is shown by default.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'tabs-panels';

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const label = (cells[0]?.textContent || `Tab ${i + 1}`).trim();
    const content = cells[1] || document.createElement('div');

    const id = `tab-${i}`;
    const btn = document.createElement('button');
    btn.className = 'tabs-tab';
    btn.type = 'button';
    btn.textContent = label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `${id}-panel`);
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.id = id;

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    panel.id = `${id}-panel`;
    panel.hidden = i !== 0;
    while (content.firstChild) panel.append(content.firstChild);

    btn.addEventListener('click', () => {
      tablist.querySelectorAll('.tabs-tab').forEach((t) => t.setAttribute('aria-selected', t === btn ? 'true' : 'false'));
      panels.querySelectorAll('.tabs-panel').forEach((p) => { p.hidden = p !== panel; });
    });

    tablist.append(btn);
    panels.append(panel);
  });

  block.replaceChildren(tablist, panels);
}

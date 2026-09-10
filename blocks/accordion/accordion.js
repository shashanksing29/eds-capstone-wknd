/*
 * Accordion block — collapsible Q&A list matching the WKND FAQ accordion.
 * Authored as two-cell rows: [question, answer]. Each becomes a <details>
 * with a +/- toggle; only one opens at a time is NOT enforced (native details),
 * so multiple can be open — matching the WKND behaviour.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const summaryContent = cells[0];
    const panelContent = cells[1];

    const details = document.createElement('details');
    details.className = 'accordion-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    if (summaryContent) {
      while (summaryContent.firstChild) summary.append(summaryContent.firstChild);
    }
    details.append(summary);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    if (panelContent) {
      while (panelContent.firstChild) body.append(panelContent.firstChild);
    }
    details.append(body);

    row.replaceWith(details);
  });
}

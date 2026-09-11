/*
 * Adventure Details — the left sidebar list on an adventure page. Authored as
 * two-cell rows: [label, value]. Renders each as a small uppercase label above
 * a bold value, with a light left border (matching WKND).
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'adventure-details-item';
    const cells = [...row.children];
    if (cells[0]) cells[0].className = 'adventure-details-label';
    if (cells[1]) cells[1].className = 'adventure-details-value';
  });
}

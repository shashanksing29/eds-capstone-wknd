/*
 * Import for the WKND search results page (/search).
 * A standalone page (not present on wknd.site) that hosts the Search block.
 * The block reads ?q= from the URL and renders matching query-index entries.
 */

export default {
  transformDOM: ({ document }) => {
    /* global WebImporter */
    const container = document.createElement('div');

    // Search block
    const searchTable = WebImporter.DOMUtils.createTable([['Search']], document);
    container.append(searchTable);

    // Metadata: title + robots noindex (search results shouldn't be indexed)
    const metaTable = WebImporter.DOMUtils.createTable([
      ['Metadata'],
      ['Title', 'Search'],
      ['Robots', 'noindex, nofollow'],
    ], document);
    container.append(metaTable);

    return container;
  },
  generateDocumentPath: () => '/search',
};

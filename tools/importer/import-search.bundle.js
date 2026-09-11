/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-search.js
  var import_search_exports = {};
  __export(import_search_exports, {
    default: () => import_search_default
  });
  var import_search_default = {
    transformDOM: ({ document }) => {
      const container = document.createElement("div");
      const searchTable = WebImporter.DOMUtils.createTable([["Search"]], document);
      container.append(searchTable);
      const metaTable = WebImporter.DOMUtils.createTable([
        ["Metadata"],
        ["Title", "Search"],
        ["Robots", "noindex, nofollow"]
      ], document);
      container.append(metaTable);
      return container;
    },
    generateDocumentPath: () => "/search"
  };
  return __toCommonJS(import_search_exports);
})();

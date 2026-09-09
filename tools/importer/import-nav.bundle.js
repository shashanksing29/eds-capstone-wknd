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

  // tools/importer/import-nav.js
  var import_nav_exports = {};
  __export(import_nav_exports, {
    default: () => import_nav_default
  });
  var NAV_LINKS = [
    ["Home", "/us/en/index"],
    ["Magazine", "/us/en/magazine"],
    ["Adventures", "/us/en/adventures"],
    ["FAQs", "/us/en/faqs"],
    ["About Us", "/us/en/about-us"]
  ];
  var import_nav_default = {
    transformDOM: ({ document }) => {
      const container = document.createElement("div");
      const brand = document.createElement("div");
      const brandP = document.createElement("p");
      const brandLink = document.createElement("a");
      brandLink.href = "/us/en/index";
      brandLink.textContent = "WKND";
      brandP.append(brandLink);
      brand.append(brandP);
      container.append(brand);
      const sections = document.createElement("div");
      const ul = document.createElement("ul");
      NAV_LINKS.forEach(([label, href]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        li.append(a);
        ul.append(li);
      });
      sections.append(ul);
      container.append(sections);
      const tools = document.createElement("div");
      const toolsP = document.createElement("p");
      toolsP.textContent = "Search";
      tools.append(toolsP);
      container.append(tools);
      return container;
    },
    generateDocumentPath: () => "/nav"
  };
  return __toCommonJS(import_nav_exports);
})();

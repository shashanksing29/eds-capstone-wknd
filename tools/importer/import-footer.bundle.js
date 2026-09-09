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

  // tools/importer/import-footer.js
  var import_footer_exports = {};
  __export(import_footer_exports, {
    default: () => import_footer_default
  });
  var NAV_LINKS = [
    ["Home", "/us/en/index"],
    ["Magazine", "/us/en/magazine"],
    ["Adventures", "/us/en/adventures"],
    ["FAQs", "/us/en/faqs"],
    ["About Us", "/us/en/about-us"]
  ];
  var SOCIAL = [["Facebook", "#"], ["Twitter", "#"], ["Instagram", "#"]];
  var import_footer_default = {
    transformDOM: ({ document }) => {
      const container = document.createElement("div");
      const nav = document.createElement("div");
      const navUl = document.createElement("ul");
      NAV_LINKS.forEach(([label, href]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        li.append(a);
        navUl.append(li);
      });
      nav.append(navUl);
      container.append(nav);
      const follow = document.createElement("div");
      const h = document.createElement("h4");
      h.textContent = "Follow Us";
      follow.append(h);
      const socialUl = document.createElement("ul");
      SOCIAL.forEach(([label, href]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        li.append(a);
        socialUl.append(li);
      });
      follow.append(socialUl);
      container.append(follow);
      const legal = document.createElement("div");
      const p = document.createElement("p");
      p.textContent = "\u24B8 2024, WKND Site. WKND is a fictitious adventure and travel website created by Adobe to demonstrate how anyone can use Adobe Experience Manager to build a beautiful, feature-rich website.";
      legal.append(p);
      container.append(legal);
      return container;
    },
    generateDocumentPath: () => "/footer"
  };
  return __toCommonJS(import_footer_exports);
})();

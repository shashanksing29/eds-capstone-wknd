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
    ["Magazine", "/magazine"],
    ["Adventures", "/adventures"],
    ["FAQs", "/faqs"],
    ["About Us", "/about-us"]
  ];
  var SOCIAL = [["Facebook", "#"], ["Twitter", "#"], ["Instagram", "#"]];
  var import_footer_default = {
    transformDOM: ({ document }) => {
      const container = document.createElement("div");
      const brand = document.createElement("p");
      const brandLink = document.createElement("a");
      brandLink.href = "/";
      brandLink.textContent = "WKND";
      brand.append(brandLink);
      container.append(brand);
      container.append(document.createElement("hr"));
      const navUl = document.createElement("ul");
      NAV_LINKS.forEach(([label, href]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        li.append(a);
        navUl.append(li);
      });
      container.append(navUl);
      container.append(document.createElement("hr"));
      const h = document.createElement("h4");
      h.textContent = "Follow Us";
      container.append(h);
      const socialUl = document.createElement("ul");
      SOCIAL.forEach(([label, href]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = label;
        li.append(a);
        socialUl.append(li);
      });
      container.append(socialUl);
      container.append(document.createElement("hr"));
      const copyright = document.createElement("p");
      copyright.textContent = "\u24B8 2019, WKND Site.";
      container.append(copyright);
      const mkLink = (text, href) => {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        return a;
      };
      const blurb = document.createElement("p");
      blurb.append(document.createTextNode(
        "WKND is a fictitious adventure and travel website created by Adobe to demonstrate how anyone can use Adobe Experience Manager to build a beautiful, feature-rich website over a single weekend. This site is built entirely with Adobe Experience Manager "
      ));
      blurb.append(mkLink("Core Components", "https://docs.adobe.com/content/help/en/experience-manager-core-components/using/introduction.html"));
      blurb.append(document.createTextNode(" and "));
      blurb.append(mkLink("Archetype", "https://github.com/adobe/aem-project-archetype"));
      blurb.append(document.createTextNode(" that are available as open source code to the public. The entire "));
      blurb.append(mkLink("site source code", "https://github.com/adobe/aem-guides-wknd/"));
      blurb.append(document.createTextNode(" is available as open source as well and is accompanied with a "));
      blurb.append(mkLink("detailed tutorial", "https://docs.adobe.com/content/help/en/experience-manager-learn/getting-started-wknd-tutorial-develop/overview.html"));
      blurb.append(document.createTextNode(" on how to recreate the site."));
      container.append(blurb);
      const stock = document.createElement("p");
      stock.append(document.createTextNode("Many of the beautiful images in the WKND site are available for purchase via "));
      stock.append(mkLink("Adobe Stock", "https://stock.adobe.com/"));
      stock.append(document.createTextNode("."));
      container.append(stock);
      return container;
    },
    generateDocumentPath: () => "/footer"
  };
  return __toCommonJS(import_footer_exports);
})();

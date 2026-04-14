import { content } from "./lib/content.js";
import { mount } from "./lib/dom.js";
import { getRoute } from "./lib/router.js";
import { createHeader } from "./sections/header.js";
import { createLeadPage } from "./sections/lead-page.js";
import { createProductsPage } from "./sections/products-page.js";

let hasShownIntro = false;

function createPage(route) {
  if (route === "/captacao") {
    return createLeadPage(content.leadPage);
  }

  return createProductsPage(content.productsPage);
}

function createIntro() {
  return document.createRange().createContextualFragment(`
    <div class="brand-intro" aria-hidden="true">
      <img src="${content.header.logo}" alt="" />
    </div>
  `);
}

export function renderApp(root) {
  if (!root) {
    throw new Error("Elemento #app não encontrado.");
  }

  const render = () => {
    const route = getRoute();
    const showIntro = !hasShownIntro;
    hasShownIntro = true;

    mount(root, [
      showIntro ? createIntro() : null,
      createHeader(content.header, route),
      createPage(route),
    ]);
  };

  render();
  window.addEventListener("popstate", render);
}

import { content } from "./lib/content.js";
import { trackPageView } from "./lib/analytics.js";
import { mount } from "./lib/dom.js";
import { getRoute } from "./lib/router.js";
import { createCookieConsent } from "./sections/cookie-consent.js";
import { createCustomerGreeting } from "./sections/customer-greeting.js";
import { createHeader } from "./sections/header.js";
import { createPrivacyPage } from "./sections/privacy-page.js";
import { createProductDetailPage } from "./sections/product-detail-page.js";
import { createShopPage } from "./sections/shop-page.js";
import { createLeadPage } from "./sections/lead-page.js";
import { createProductsPage } from "./sections/products-page.js";

let hasShownIntro = false;

function createPage(route) {
  if (route.startsWith("/produto/")) {
    return createProductDetailPage(decodeURIComponent(route.replace("/produto/", "")));
  }

  if (route === "/captacao") {
    return createLeadPage(content.leadPage);
  }

  if (route === "/loja") {
    return createShopPage(content.shopPage, content.header.account.href);
  }

  if (route === "/privacidade") {
    return createPrivacyPage();
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
      createCustomerGreeting(),
      createPage(route),
      createCookieConsent(),
    ]);
    trackPageView({ route });
  };

  render();
  window.addEventListener("popstate", render);
}

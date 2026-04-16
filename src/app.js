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
  const isMobileIntro = window.matchMedia("(max-width: 680px), (pointer: coarse)").matches;
  const columns = isMobileIntro ? 10 : 24;
  const rows = isMobileIntro ? 6 : 14;
  const dustCount = isMobileIntro ? 50 : 360;
  const pieces = Array.from({ length: columns * rows }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = (column / columns) * 100;
    const top = (row / rows) * 100;
    const right = 100 - ((column + 1) / columns) * 100;
    const bottom = 100 - ((row + 1) / rows) * 100;
    const dx = (column + 0.5) / columns - 0.5;
    const dy = (row + 0.5) / rows - 0.5;
    const wave = Math.sin(index * 12.9898) * Math.cos(index * 78.233);
    const distance = 180 + Math.hypot(dx, dy) * 560 + Math.abs(wave) * 150;
    const angle = Math.atan2(dy, dx) + wave * 0.9;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const rotate = wave * 520;

    return `<span class="brand-intro__piece" style="--clip: inset(${top}% ${right}% ${bottom}% ${left}%); --x: ${x.toFixed(1)}px; --y: ${y.toFixed(1)}px; --r: ${rotate.toFixed(1)}deg;">
      <img src="${content.header.logo}" alt="" />
    </span>`;
  }).join("");
  const dust = Array.from({ length: dustCount }, (_, index) => {
    const spiral = index * 2.399963;
    const ring = Math.sqrt(index / dustCount);
    const wave = Math.sin(index * 19.19);
    const distance = 90 + ring * 660 + Math.abs(wave) * 170;
    const x = Math.cos(spiral + wave) * distance;
    const y = Math.sin(spiral + wave) * distance;
    const size = 1 + (index % 5) * 0.55;
    const hue = index % 3;

    return `<i class="brand-intro__dust brand-intro__dust--${hue}" style="--x: ${x.toFixed(1)}px; --y: ${y.toFixed(1)}px; --s: ${size.toFixed(2)}px;"></i>`;
  }).join("");

  const intro = document.createElement("div");
  intro.className = "brand-intro";
  intro.setAttribute("aria-hidden", "true");
  intro.innerHTML = `
    <div class="brand-intro__logo">
      <img class="brand-intro__whole" src="${content.header.logo}" alt="" />
      ${pieces}
      ${dust}
    </div>
  `;
  window.setTimeout(() => intro.remove(), 3200);

  return intro;
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

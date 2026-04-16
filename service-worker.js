const CACHE_NAME = "garimpo-nautico-shell-v5";
const SHELL_ASSETS = [
  "/",
  "/produtos",
  "/captacao",
  "/loja",
  "/privacidade",
  "/manifest.webmanifest",
  "/src/main.js",
  "/src/app.js",
  "/src/lib/analytics.js",
  "/src/lib/cart.js",
  "/src/lib/content.js",
  "/src/lib/customer.js",
  "/src/lib/dom.js",
  "/src/lib/marketing-config.js",
  "/src/lib/products.js",
  "/src/lib/router.js",
  "/src/lib/visitor-intent.js",
  "/src/sections/cookie-consent.js",
  "/src/sections/header.js",
  "/src/sections/customer-greeting.js",
  "/src/sections/lead-page.js",
  "/src/sections/privacy-page.js",
  "/src/sections/product-detail-page.js",
  "/src/sections/products-page.js",
  "/src/sections/shop-page.js",
  "/src/styles/base.css",
  "/src/styles/layout.css",
  "/src/styles/sections.css",
  "/src/assets/favicon.png",
  "/src/assets/app-icon-192.png",
  "/src/assets/app-icon-512.png",
  "/src/assets/logo-garimpo-nautico-transparent.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

const consentKey = "garimpo-consent";

const defaultConfig = {
  googleTagManagerId: "",
  metaPixelId: "",
};

function getConfig() {
  return {
    ...defaultConfig,
    ...(window.GARIMPO_MARKETING_CONFIG || {}),
  };
}

function getDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function gtag() {
  getDataLayer().push(arguments);
}

function readConsent() {
  try {
    return JSON.parse(localStorage.getItem(consentKey) || "null");
  } catch {
    return null;
  }
}

function saveConsent(consent) {
  localStorage.setItem(consentKey, JSON.stringify({
    ...consent,
    updatedAt: new Date().toISOString(),
  }));
}

function loadScript(id, src) {
  if (!src || document.getElementById(id)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.id = id;
  script.src = src;
  document.head.append(script);
}

function loadGoogleTagManager(containerId) {
  if (!containerId) {
    return;
  }

  getDataLayer().push({
    "gtm.start": Date.now(),
    event: "gtm.js",
  });
  loadScript("garimpo-gtm", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`);
}

function loadMetaPixel(pixelId) {
  if (!pixelId || window.fbq) {
    return;
  }

  const fbq = function () {
    fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  loadScript("garimpo-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", pixelId);
  fbq("track", "PageView");
}

function applyConsent(consent) {
  const marketingGranted = consent?.marketing === true;
  const analyticsGranted = consent?.analytics === true;
  const config = getConfig();

  gtag("consent", "update", {
    ad_storage: marketingGranted ? "granted" : "denied",
    ad_user_data: marketingGranted ? "granted" : "denied",
    ad_personalization: marketingGranted ? "granted" : "denied",
    analytics_storage: analyticsGranted ? "granted" : "denied",
  });

  if (analyticsGranted || marketingGranted) {
    loadGoogleTagManager(config.googleTagManagerId);
  }

  if (marketingGranted) {
    loadMetaPixel(config.metaPixelId);
  }
}

export function getConsent() {
  return readConsent();
}

export function setConsent(consent) {
  saveConsent(consent);
  applyConsent(consent);
  window.dispatchEvent(new CustomEvent("garimpo:consent-change", { detail: { consent } }));
}

export function initAnalytics() {
  getDataLayer();
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500,
  });

  const consent = readConsent();
  if (consent) {
    applyConsent(consent);
  }
}

export function hasMarketingConsent() {
  return readConsent()?.marketing === true;
}

export function trackEvent(name, params = {}) {
  const payload = {
    event: name,
    page_path: window.location.pathname,
    page_title: document.title,
    ...params,
  };

  getDataLayer().push(payload);

  if (hasMarketingConsent() && window.fbq) {
    window.fbq("trackCustom", name, params);
  }
}

export function trackPageView(params = {}) {
  trackEvent("page_view", {
    page_location: window.location.href,
    ...params,
  });

  if (hasMarketingConsent() && window.fbq) {
    window.fbq("track", "PageView");
  }
}

const intentKey = "garimpo-visitor-intent";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value || "") || fallback;
  } catch {
    return fallback;
  }
}

function readIntent() {
  return safeParse(localStorage.getItem(intentKey), {
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()),
    firstSeenAt: new Date().toISOString(),
    source: {},
    searches: [],
    products: [],
    events: [],
    converted: false,
  });
}

function writeIntent(intent) {
  localStorage.setItem(intentKey, JSON.stringify({
    ...intent,
    lastSeenAt: new Date().toISOString(),
  }));
}

function uniqueLatest(list, item, key, limit) {
  const filtered = list.filter((entry) => entry[key] !== item[key]);
  return [item, ...filtered].slice(0, limit);
}

export function captureAttribution() {
  const intent = readIntent();
  const params = new URLSearchParams(window.location.search);
  const source = {
    referrer: document.referrer || intent.source.referrer || "",
    utmSource: params.get("utm_source") || intent.source.utmSource || "",
    utmMedium: params.get("utm_medium") || intent.source.utmMedium || "",
    utmCampaign: params.get("utm_campaign") || intent.source.utmCampaign || "",
  };

  writeIntent({ ...intent, source });
}

export function recordIntentEvent(type, detail = {}) {
  const intent = readIntent();
  writeIntent({
    ...intent,
    events: [{
      type,
      detail,
      at: new Date().toISOString(),
      path: window.location.pathname,
    }, ...intent.events].slice(0, 40),
  });
}

export function recordSearch(query, filters = {}) {
  const normalized = String(query || "").trim();

  if (!normalized) {
    return;
  }

  const intent = readIntent();
  writeIntent({
    ...intent,
    searches: uniqueLatest(intent.searches, {
      query: normalized,
      filters,
      at: new Date().toISOString(),
    }, "query", 12),
  });
}

export function recordProductView(product) {
  if (!product) {
    return;
  }

  const intent = readIntent();
  writeIntent({
    ...intent,
    products: uniqueLatest(intent.products, {
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      at: new Date().toISOString(),
    }, "id", 16),
  });
}

export function markConverted(type) {
  const intent = readIntent();
  writeIntent({
    ...intent,
    converted: true,
    conversionType: type,
    convertedAt: new Date().toISOString(),
  });
}

export function getVisitorIntent() {
  return readIntent();
}

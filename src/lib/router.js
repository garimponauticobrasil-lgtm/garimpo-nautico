const routes = new Set(["/", "/produtos", "/captacao", "/loja", "/privacidade"]);

export function getRoute() {
  if (window.location.pathname === "/") {
    return "/";
  }

  if (window.location.pathname.startsWith("/produto/")) {
    return window.location.pathname;
  }

  return routes.has(window.location.pathname) ? window.location.pathname : "/";
}

export function navigate(path) {
  if (!routes.has(path) && !path.startsWith("/produto/")) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

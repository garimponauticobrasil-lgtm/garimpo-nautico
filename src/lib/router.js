const routes = new Set(["/", "/produtos", "/captacao"]);

export function getRoute() {
  if (window.location.pathname === "/") {
    return "/produtos";
  }

  return routes.has(window.location.pathname) ? window.location.pathname : "/produtos";
}

export function navigate(path) {
  if (!routes.has(path)) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

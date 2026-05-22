const routes = new Set(["/", "/produtos", "/captacao", "/loja", "/privacidade"]);

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function getRoute() {
  const pathname = normalizePath(window.location.pathname);

  if (pathname === "/") {
    return "/";
  }

  if (pathname.startsWith("/produto/")) {
    return pathname;
  }

  return routes.has(pathname) ? pathname : "/";
}

export function navigate(path) {
  if (!routes.has(path) && !path.startsWith("/produto/")) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

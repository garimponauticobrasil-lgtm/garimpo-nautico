import { getCartCount } from "../lib/cart.js";
import { trackEvent } from "../lib/analytics.js";
import { el } from "../lib/dom.js";
import { navigate } from "../lib/router.js";
import { markConverted, recordIntentEvent } from "../lib/visitor-intent.js";

function createWhatsAppIcon() {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const path = document.createElementNS(namespace, "path");

  svg.setAttribute("class", "whatsapp-icon");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  path.setAttribute(
    "d",
    "M13.6 2.3A7.85 7.85 0 0 0 8 0a7.94 7.94 0 0 0-6.87 11.91L0 16l4.2-1.1A7.92 7.92 0 0 0 8 15.87h.01A7.93 7.93 0 0 0 16 8a7.88 7.88 0 0 0-2.4-5.7ZM8 14.53a6.58 6.58 0 0 1-3.35-.92l-.24-.14-2.49.65.66-2.43-.16-.25A6.6 6.6 0 1 1 8 14.53Zm3.62-4.93c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1-.13.2-.51.64-.63.77-.12.13-.23.15-.43.05-.2-.1-.84-.31-1.6-.99a5.99 5.99 0 0 1-1.1-1.37c-.12-.2-.01-.31.09-.41.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.06-.13.03-.25-.02-.35-.05-.1-.44-1.06-.6-1.45-.16-.38-.32-.33-.44-.34h-.38c-.13 0-.35.05-.53.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.06c.1.13 1.41 2.15 3.42 3.02.48.21.85.33 1.14.42.48.15.92.13 1.26.08.39-.06 1.17-.48 1.34-.94.17-.46.17-.86.12-.94-.05-.08-.18-.13-.38-.23Z",
  );
  svg.append(path);

  return svg;
}

function createCartIcon() {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  const path = document.createElementNS(namespace, "path");

  svg.setAttribute("class", "nav-icon nav-icon--cart");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  path.setAttribute(
    "d",
    "M7.2 19.6a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0Zm11.2 0a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0ZM3.2 4.4H1.5V2.6h2.9c.45 0 .84.32.93.76l.45 2.22h15.06c.31 0 .6.15.78.4.18.25.23.57.14.86l-2.25 7.2a.94.94 0 0 1-.9.66H7.5l.27 1.34h10.7v1.8H6.98a.94.94 0 0 1-.92-.76L3.2 4.4Zm2.94 2.98 1.1 5.52h10.69l1.72-5.52H6.14Z",
  );
  svg.append(path);

  return svg;
}

function createNavLink(link, currentPath) {
  const isActive = link.href === currentPath;
  const cartBadge = link.icon === "cart" ? el("span", { className: "cart-badge" }) : null;
  const updateCartBadge = () => {
    if (!cartBadge) {
      return;
    }

    const count = getCartCount();
    cartBadge.textContent = String(count);
    cartBadge.hidden = count === 0;
  };
  const children = link.icon === "cart"
    ? [createCartIcon(), cartBadge, el("span", { className: "visually-hidden", text: link.label })]
    : link.label;
  const linkNode = el("a", {
    href: link.href,
    className: link.icon ? "site-nav__icon-link" : undefined,
    "aria-label": link.icon ? link.label : undefined,
    title: link.icon ? link.label : undefined,
    "aria-current": isActive ? "page" : undefined,
    onClick: (event) => {
      event.preventDefault();
      navigate(link.href);
    },
  }, children);

  if (link.icon === "cart") {
    updateCartBadge();
    window.addEventListener("garimpo:cart-change", updateCartBadge);
    window.addEventListener("storage", updateCartBadge);
  }

  return linkNode;
}

function isInternalPath(href) {
  return href.startsWith("/");
}

export function createHeader({ brand, logo, links, appDownload, account }, currentPath) {
  return el("header", { className: "site-header" }, [
    el("a", {
      className: "brand",
      href: "/",
      "aria-label": brand,
      onClick: (event) => {
        event.preventDefault();
        navigate("/");
      },
    }, [
      el("img", { src: logo, alt: brand }),
    ]),
    el("div", { className: "header-actions" }, [
      el(
        "nav",
        { className: "site-nav", "aria-label": "Navegação principal" },
        links.map((link) => createNavLink(link, currentPath)),
      ),
      appDownload ? el("a", {
        className: "app-download-link",
        href: appDownload.href,
        download: appDownload.filename,
        onClick: () => {
          trackEvent("app_download_click", { location: "header" });
          recordIntentEvent("app_download_click", { location: "header" });
          markConverted("app_download");
        },
      }, [
        el("span", { text: appDownload.label }),
      ]) : null,
      el("a", {
        className: "account-link",
        href: account.href,
        onClick: (event) => {
          trackEvent("contact_whatsapp_click", { location: "header" });
          recordIntentEvent("whatsapp_click", { location: "header" });
          markConverted("whatsapp");

          if (!isInternalPath(account.href)) {
            return;
          }

          event.preventDefault();
          navigate(account.href);
        },
      }, [
        createWhatsAppIcon(),
        el("span", { text: account.label }),
      ]),
    ]),
  ]);
}

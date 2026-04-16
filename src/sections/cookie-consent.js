import { getConsent, setConsent } from "../lib/analytics.js";
import { el } from "../lib/dom.js";
import { navigate } from "../lib/router.js";

function acceptAll(banner) {
  setConsent({ necessary: true, analytics: true, marketing: true });
  banner.remove();
}

function rejectOptional(banner) {
  setConsent({ necessary: true, analytics: false, marketing: false });
  banner.remove();
}

export function createCookieConsent() {
  if (getConsent()) {
    return null;
  }

  const banner = el("section", {
    className: "cookie-consent",
    role: "dialog",
    "aria-label": "Preferencias de cookies",
  }, [
    el("div", { className: "cookie-consent__copy" }, [
      el("strong", { text: "Cookies do Garimpo Nautico" }),
      el("p", {
        text: "Usamos cookies essenciais para o site funcionar. Com sua autorizacao, medimos visitas e lembramos voce de produtos nauticos em anuncios.",
      }),
      el("a", {
        href: "/privacidade",
        text: "Ler politica de privacidade",
        onClick: (event) => {
          event.preventDefault();
          navigate("/privacidade");
        },
      }),
    ]),
    el("div", { className: "cookie-consent__actions" }, [
      el("button", {
        className: "button button-secondary",
        type: "button",
        text: "Recusar opcionais",
        onClick: () => rejectOptional(banner),
      }),
      el("button", {
        className: "button",
        type: "button",
        text: "Aceitar medicao e anuncios",
        onClick: () => acceptAll(banner),
      }),
    ]),
  ]);

  return banner;
}

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
    "aria-label": "Prefer\u00eancias de cookies",
  }, [
    el("div", { className: "cookie-consent__copy" }, [
      el("strong", { text: "Cookies do Garimpo N\u00e1utico" }),
      el("p", {
        text: "Usamos cookies essenciais para o site funcionar. Com sua autoriza\u00e7\u00e3o, medimos visitas e lembramos voc\u00ea de produtos n\u00e1uticos em an\u00fancios.",
      }),
      el("a", {
        href: "/privacidade",
        text: "Ler pol\u00edtica de privacidade",
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
        text: "Aceitar medi\u00e7\u00e3o e an\u00fancios",
        onClick: () => acceptAll(banner),
      }),
    ]),
  ]);

  return banner;
}

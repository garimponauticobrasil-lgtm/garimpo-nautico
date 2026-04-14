import { el } from "../lib/dom.js";
import { navigate } from "../lib/router.js";

function createNavLink(link, currentPath) {
  const isActive = link.href === currentPath;

  return el("a", {
    href: link.href,
    text: link.label,
    "aria-current": isActive ? "page" : undefined,
    onClick: (event) => {
      event.preventDefault();
      navigate(link.href);
    },
  });
}

export function createHeader({ brand, logo, links, account }, currentPath) {
  return el("header", { className: "site-header" }, [
    el("a", {
      className: "brand",
      href: "/produtos",
      "aria-label": brand,
      onClick: (event) => {
        event.preventDefault();
        navigate("/produtos");
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
      el("a", {
        className: "account-link",
        href: account.href,
        text: account.label,
        onClick: (event) => {
          event.preventDefault();
          navigate(account.href);
        },
      }),
    ]),
  ]);
}

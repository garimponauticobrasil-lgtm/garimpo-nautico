import { el } from "../lib/dom.js";

export function createHero({ eyebrow, title, text, action }) {
  return el("main", { id: "inicio", className: "hero" }, [
    el("p", { className: "eyebrow", text: eyebrow }),
    el("h1", { text: title }),
    el("p", { className: "hero-text", text }),
    el("a", { className: "button", href: action.href, text: action.label }),
  ]);
}

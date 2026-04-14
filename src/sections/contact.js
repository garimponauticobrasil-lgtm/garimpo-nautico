import { el } from "../lib/dom.js";

export function createContact({ title, text, email }) {
  return el("section", { id: "contato", className: "section contact" }, [
    el("h2", { text: title }),
    el("p", { text }),
    el("a", { href: `mailto:${email}`, text: email }),
  ]);
}

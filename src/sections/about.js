import { el } from "../lib/dom.js";

export function createAbout({ title, text }) {
  return el("section", { id: "sobre", className: "section" }, [
    el("h2", { text: title }),
    el("p", { text }),
  ]);
}

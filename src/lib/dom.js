export function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  const childList = Array.isArray(children) ? children : [children];

  Object.entries(options).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "className") {
      node.className = value;
      return;
    }

    if (key === "text") {
      node.textContent = value;
      return;
    }

    if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }

    if (typeof value === "boolean") {
      if (value) {
        node.setAttribute(key, "");
      }
      return;
    }

    node.setAttribute(key, value);
  });

  childList.forEach((child) => {
    if (child === undefined || child === null) {
      return;
    }

    node.append(child);
  });

  return node;
}

export function mount(root, children) {
  root.replaceChildren(...children.filter(Boolean));
}

export function text(value) {
  return document.createTextNode(value);
}

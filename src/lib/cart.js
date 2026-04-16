const cartKey = "garimpo-cart";

function notifyCartChange(cart) {
  window.dispatchEvent(new CustomEvent("garimpo:cart-change", { detail: { cart } }));
}

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || "{}");
  } catch {
    return {};
  }
}

export function writeCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  notifyCartChange(cart);
}

export function getCartCount(cart = readCart()) {
  return Object.values(cart).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
}

export function getCartQuantity(id, cart = readCart()) {
  return Number(cart[id] || 0);
}

export function clearCart() {
  writeCart({});
}

export function addCartItem(id, maxQuantity = Infinity) {
  const cart = readCart();
  const quantity = Math.min((cart[id] || 0) + 1, maxQuantity);
  const nextCart = { ...cart, [id]: quantity };

  writeCart(nextCart);
  return nextCart;
}

export function updateCartItem(id, quantity, maxQuantity = Infinity) {
  const cart = readCart();
  const nextCart = { ...cart };

  if (quantity <= 0) {
    delete nextCart[id];
  } else {
    nextCart[id] = Math.min(quantity, maxQuantity);
  }

  writeCart(nextCart);
  return nextCart;
}

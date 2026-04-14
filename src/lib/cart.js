const cartKey = "garimpo-cart";

export function readCart() {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || "{}");
  } catch {
    return {};
  }
}

export function writeCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

export function addCartItem(id) {
  const cart = readCart();
  const nextCart = { ...cart, [id]: (cart[id] || 0) + 1 };

  writeCart(nextCart);
  return nextCart;
}

export function updateCartItem(id, quantity) {
  const cart = readCart();
  const nextCart = { ...cart };

  if (quantity <= 0) {
    delete nextCart[id];
  } else {
    nextCart[id] = quantity;
  }

  writeCart(nextCart);
  return nextCart;
}

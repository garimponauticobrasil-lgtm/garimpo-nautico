import { readCart, updateCartItem } from "../lib/cart.js";
import { el } from "../lib/dom.js";
import { navigate } from "../lib/router.js";
import { formatPrice, products } from "../lib/products.js";

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function getCartItems(cart) {
  return Object.entries(cart)
    .map(([id, quantity]) => ({ product: getProduct(id), quantity }))
    .filter((item) => item.product && item.quantity > 0);
}

function getWhatsAppNumber(href) {
  return href.replace(/\D/g, "") || "5524992527966";
}

function buildWhatsAppMessage(items, formData) {
  const itemLines = items.map(({ product, quantity }) => (
    `- ${quantity}x ${product.title} (${formatPrice(product.price)})`
  ));
  const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  return [
    "Olá, equipe Garimpo Náutico. Quero confirmar este pedido:",
    "",
    ...itemLines,
    "",
    `Total estimado: ${formatPrice(total)}`,
    `Nome: ${formData.get("nome")}`,
    `WhatsApp: ${formData.get("whatsapp")}`,
    `Cidade: ${formData.get("cidade")}`,
    `Observação: ${formData.get("observacao") || "Sem observação"}`,
  ].join("\n");
}

function createCartItem({ product, quantity }, updateQuantity) {
  return el("div", { className: "cart-item" }, [
    el("div", {}, [
      el("strong", { text: product.title }),
      el("p", { text: `${quantity} x ${formatPrice(product.price)}` }),
    ]),
    el("div", { className: "cart-item__actions" }, [
      el("button", {
        type: "button",
        "aria-label": `Diminuir ${product.title}`,
        text: "-",
        onClick: () => updateQuantity(product.id, quantity - 1),
      }),
      el("span", { text: String(quantity) }),
      el("button", {
        type: "button",
        "aria-label": `Aumentar ${product.title}`,
        text: "+",
        onClick: () => updateQuantity(product.id, quantity + 1),
      }),
    ]),
  ]);
}

export function createShopPage(copy, checkoutHref) {
  let cart = readCart();
  const number = getWhatsAppNumber(checkoutHref);
  const cartList = el("div", { className: "cart-list" });
  const cartTotal = el("strong", { className: "cart-total" });
  const checkoutButton = el("button", { className: "button", type: "submit", text: "Enviar pedido no WhatsApp" });
  const status = el("p", { className: "form-status", role: "status", "aria-live": "polite" });

  const renderCart = () => {
    const items = getCartItems(cart);
    const total = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

    cartList.replaceChildren(...(items.length
      ? items.map((item) => createCartItem(item, updateQuantity))
      : [
        el("div", { className: "cart-empty" }, [
          el("p", { text: copy.emptyCart }),
          el("a", {
            className: "button button-secondary",
            href: "/produtos",
            text: "Escolher peças",
            onClick: (event) => {
              event.preventDefault();
              navigate("/produtos");
            },
          }),
        ]),
    ]));
    cartTotal.textContent = `Total: ${formatPrice(total)}`;
    checkoutButton.disabled = items.length === 0;
    checkoutForm.hidden = items.length === 0;
  };

  function updateQuantity(id, quantity) {
    cart = updateCartItem(id, quantity);
    renderCart();
  }

  const checkoutForm = el("form", {
    className: "shop-checkout",
    onSubmit: (event) => {
      event.preventDefault();
      const items = getCartItems(cart);

      if (!items.length) {
        status.textContent = "Adicione uma peça ao carrinho para continuar.";
        status.setAttribute("data-state", "error");
        return;
      }

      const message = buildWhatsAppMessage(items, new FormData(event.currentTarget));
      window.location.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    },
  }, [
    el("h2", { text: copy.checkoutTitle }),
    el("p", { text: copy.checkoutHint }),
    el("label", { className: "form-field" }, [
      el("span", { text: "Nome" }),
      el("input", { name: "nome", placeholder: "Seu nome", required: true, type: "text" }),
    ]),
    el("label", { className: "form-field" }, [
      el("span", { text: "WhatsApp" }),
      el("input", { name: "whatsapp", placeholder: "(00) 00000-0000", required: true, type: "tel" }),
    ]),
    el("label", { className: "form-field" }, [
      el("span", { text: "Cidade" }),
      el("input", { name: "cidade", placeholder: "Cidade e estado", required: true, type: "text" }),
    ]),
    el("label", { className: "form-field" }, [
      el("span", { text: "Observação" }),
      el("textarea", { name: "observacao", placeholder: "Prazo, retirada, envio ou detalhe da peça", rows: "4" }),
    ]),
    checkoutButton,
    status,
  ]);

  renderCart();

  return el("main", { className: "page-shell shop-page" }, [
    el("section", { className: "page-intro shop-intro" }, [
      el("p", { className: "eyebrow", text: copy.eyebrow }),
      el("h1", { text: copy.title }),
      el("p", { className: "hero-text", text: copy.text }),
    ]),
    el("section", { className: "shop-layout shop-layout--cart-only" }, [
      el("aside", { className: "shop-cart" }, [
        el("h2", { text: copy.cartTitle }),
        cartList,
        cartTotal,
        checkoutForm,
      ]),
    ]),
  ]);
}

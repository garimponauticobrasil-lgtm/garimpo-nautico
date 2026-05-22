import { clearCart, readCart, updateCartItem } from "../lib/cart.js";
import { saveCustomer } from "../lib/customer.js";
import { trackEvent } from "../lib/analytics.js";
import { el } from "../lib/dom.js";
import { navigate } from "../lib/router.js";
import { markConverted, recordIntentEvent } from "../lib/visitor-intent.js";
import { findProduct, formatPrice, getInventory } from "../lib/products.js";

function getCartItems(cart) {
  return Object.entries(cart)
    .map(([id, quantity]) => ({ product: findProduct(id), quantity }))
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
    `Entrega: ${formData.get("entrega")}`,
    `Endereço/retirada: ${formData.get("endereco") || "A combinar"}`,
    `Pagamento: ${formData.get("pagamento")}`,
    "Observação de pagamento: enviar link seguro Stone após confirmação de estoque e frete.",
    `Observação: ${formData.get("observacao") || "Sem observação"}`,
  ].join("\n");
}

function createCartItem({ product, quantity }, updateQuantity) {
  const inventory = getInventory(product);
  const canAdd = quantity < inventory.stock;

  return el("div", { className: "cart-item" }, [
    el("div", {}, [
      el("strong", { text: product.title }),
      el("p", { text: `${quantity} x ${formatPrice(product.price)}` }),
      el("small", { text: `${inventory.status} · ${inventory.stock} em estoque` }),
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
        disabled: !canAdd,
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
            href: "/",
            text: "Escolher peças",
            onClick: (event) => {
              event.preventDefault();
              navigate("/");
            },
          }),
        ]),
      ]));
    cartTotal.textContent = `Total: ${formatPrice(total)}`;
    checkoutButton.disabled = items.length === 0;
    checkoutForm.hidden = items.length === 0;
  };

  function updateQuantity(id, quantity) {
    const product = findProduct(id);
    const inventory = product ? getInventory(product) : { stock: 0 };

    cart = updateCartItem(id, quantity, inventory.stock);
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
      const data = new FormData(event.currentTarget);
      saveCustomer({
        name: data.get("nome"),
        contact: data.get("whatsapp"),
        source: "checkout",
      });
      trackEvent("begin_checkout_whatsapp", {
        value: items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0),
        currency: "BRL",
        items: items.map(({ product, quantity }) => ({
          item_id: product.id,
          item_name: product.title,
          item_category: product.category,
          price: product.price,
          quantity,
        })),
      });
      recordIntentEvent("checkout_whatsapp", {
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      });
      markConverted("checkout_whatsapp");
      clearCart();
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
      el("span", { text: "Entrega" }),
      el("select", { name: "entrega", required: true }, [
        el("option", { value: "Retirada combinada", text: "Retirada combinada" }),
        el("option", { value: "Cotar envio", text: "Cotar envio" }),
      ]),
    ]),
    el("label", { className: "form-field" }, [
      el("span", { text: "Endereço ou marina" }),
      el("input", { name: "endereco", placeholder: "Para cotar envio ou combinar retirada", type: "text" }),
    ]),
    el("label", { className: "form-field" }, [
      el("span", { text: "Pagamento" }),
      el("select", { name: "pagamento", required: true }, [
        el("option", { value: "Link seguro Stone após confirmação", text: "Link seguro Stone após confirmação" }),
        el("option", { value: "Cartão via Stone", text: "Cartão via Stone" }),
        el("option", { value: "Pix via Stone", text: "Pix via Stone" }),
      ]),
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

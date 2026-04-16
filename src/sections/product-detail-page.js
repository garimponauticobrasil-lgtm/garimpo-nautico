import { addCartItem, getCartQuantity } from "../lib/cart.js";
import { trackEvent } from "../lib/analytics.js";
import { el } from "../lib/dom.js";
import { navigate } from "../lib/router.js";
import { findProduct, formatPrice, getInventory } from "../lib/products.js";
import { recordIntentEvent, recordProductView } from "../lib/visitor-intent.js";

function createDetailGallery(product) {
  const images = (product.gallery?.length ? product.gallery : [product.photo]).filter(Boolean);
  const mainImage = el("img", { src: images[0], alt: product.title });

  return el("div", { className: "detail-gallery" }, [
    el("div", { className: "detail-gallery__main" }, [mainImage]),
    el("div", { className: "detail-gallery__thumbs" }, images.map((src, index) => (
      el("button", {
        className: index === 0 ? "detail-gallery__thumb is-active" : "detail-gallery__thumb",
        type: "button",
        "aria-label": `Ver foto ${index + 1}`,
        onClick: (event) => {
          mainImage.src = src;
          event.currentTarget.parentElement.querySelectorAll(".detail-gallery__thumb").forEach((button) => {
            button.classList.toggle("is-active", button === event.currentTarget);
          });
        },
      }, [
        el("img", { src, alt: "" }),
      ])
    ))),
  ]);
}

function createStockText(product) {
  const inventory = getInventory(product);

  if (inventory.stock <= 0) {
    return "Indisponível no momento";
  }

  if (inventory.stock === 1) {
    return "1 unidade disponível";
  }

  return `${inventory.stock} unidades disponíveis`;
}

export function createProductDetailPage(productId) {
  const product = findProduct(productId);

  if (!product) {
    return el("main", { className: "page-shell detail-page" }, [
      el("section", { className: "page-intro" }, [
        el("p", { className: "eyebrow", text: "Peça não encontrada" }),
        el("h1", { text: "Essa peça não está mais no catálogo." }),
        el("p", { className: "hero-text", text: "Volte para produtos e escolha outra peça disponível." }),
        el("div", { className: "hero-actions" }, [
          el("a", {
            className: "button hero-cta-primary",
            href: "/",
            text: "Voltar para produtos",
            onClick: (event) => {
              event.preventDefault();
              navigate("/");
            },
          }),
        ]),
      ]),
    ]);
  }

  const inventory = getInventory(product);
  recordProductView(product);
  trackEvent("view_item", {
    currency: "BRL",
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.title,
      item_category: product.category,
      price: product.price,
    }],
  });

  const status = el("p", { className: "detail-status", role: "status", "aria-live": "polite" });
  const initialQuantity = getCartQuantity(product.id);
  const canAddInitial = inventory.stock > 0 && initialQuantity < inventory.stock;
  const addButton = el("button", {
    className: "button",
    type: "button",
    text: inventory.stock <= 0
      ? "Indisponível"
      : canAddInitial
        ? "Colocar no carrinho"
        : "Limite no carrinho",
    disabled: !canAddInitial,
    onClick: () => {
      addCartItem(product.id, inventory.stock);
      const quantity = getCartQuantity(product.id);
      trackEvent("add_to_cart", {
        currency: "BRL",
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.title,
          item_category: product.category,
          price: product.price,
          quantity: 1,
        }],
      });
      recordIntentEvent("add_to_cart", { productId: product.id, location: "detail" });
      status.textContent = `${quantity} no carrinho.`;
      addButton.textContent = quantity >= inventory.stock ? "Limite no carrinho" : "Adicionar mais uma";
      addButton.disabled = quantity >= inventory.stock;
    },
  });

  return el("main", { className: "page-shell detail-page" }, [
    el("section", { className: "page-intro detail-intro" }, [
      el("p", { className: "eyebrow", text: product.category }),
      el("h1", { text: product.title }),
      el("p", { className: "hero-text", text: product.description }),
    ]),
    el("section", { className: "detail-layout" }, [
      createDetailGallery(product),
      el("aside", { className: "detail-panel" }, [
        el("p", { className: "panel-kicker", text: inventory.status }),
        el("h2", { text: formatPrice(product.price) }),
        el("p", { className: "detail-stock", text: createStockText(product) }),
        el("dl", { className: "detail-specs" }, [
          el("dt", { text: "Compatibilidade" }),
          el("dd", { text: product.compatibility }),
          el("dt", { text: "Código" }),
          el("dd", { text: product.partNumber }),
          el("dt", { text: "Local" }),
          el("dd", { text: product.city }),
          el("dt", { text: "Envio" }),
          el("dd", { text: inventory.shipping }),
          el("dt", { text: "Condição" }),
          el("dd", { text: product.condition }),
        ]),
        el("div", { className: "detail-actions" }, [
          addButton,
          el("a", {
            className: "button button-secondary",
            href: "/loja",
            text: "Abrir carrinho",
            onClick: (event) => {
              event.preventDefault();
              navigate("/loja");
            },
          }),
        ]),
        status,
      ]),
    ]),
  ]);
}

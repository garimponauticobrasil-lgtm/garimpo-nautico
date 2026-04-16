import { categories, formatPrice, products } from "../lib/products.js";
import { addCartItem, getCartQuantity } from "../lib/cart.js";
import { trackEvent } from "../lib/analytics.js";
import { el } from "../lib/dom.js";
import { getInventory } from "../lib/products.js";
import { navigate } from "../lib/router.js";
import { recordIntentEvent, recordProductView, recordSearch } from "../lib/visitor-intent.js";

const allCategories = "Todas";

function createGallery(product, startIndex = 0) {
  const images = (product.gallery?.length ? product.gallery : [product.photo]).filter(Boolean).slice(0, 3);
  let currentIndex = startIndex;
  const image = el("img", { src: images[currentIndex], alt: product.title });
  const counter = el("p", { className: "gallery-counter" });
  const previous = el("button", { className: "gallery-nav gallery-prev", type: "button", text: "Anterior" });
  const next = el("button", { className: "gallery-nav gallery-next", type: "button", text: "Pr\u00f3xima" });
  const thumbnails = el("div", { className: "gallery-thumbs" });

  const render = () => {
    image.src = images[currentIndex];
    counter.textContent = `${currentIndex + 1} de ${images.length}`;
    previous.disabled = images.length <= 1;
    next.disabled = images.length <= 1;
    thumbnails.replaceChildren(...images.map((src, index) => (
      el("button", {
        className: index === currentIndex ? "gallery-thumb is-active" : "gallery-thumb",
        type: "button",
        "aria-label": `Ver foto ${index + 1}`,
        onClick: () => {
          currentIndex = index;
          render();
        },
      }, [
        el("img", { src, alt: "" }),
      ])
    )));
  };

  const overlay = el("div", {
    className: "gallery-overlay",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": `Fotos de ${product.title}`,
    tabindex: "-1",
    onClick: (event) => {
      if (event.target === overlay) {
        overlay.remove();
      }
    },
  }, [
    el("div", { className: "gallery-modal" }, [
      el("div", { className: "gallery-header" }, [
        el("div", {}, [
          el("p", { className: "eyebrow", text: product.category }),
          el("h2", { text: product.title }),
        ]),
        el("button", {
          className: "gallery-close",
          type: "button",
          text: "Fechar",
          onClick: () => overlay.remove(),
        }),
      ]),
      el("div", { className: "gallery-stage" }, [
        previous,
        image,
        next,
      ]),
      el("div", { className: "gallery-footer" }, [
        counter,
        thumbnails,
      ]),
    ]),
  ]);

  previous.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    render();
  });
  next.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    render();
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      overlay.remove();
    }
    if (event.key === "ArrowLeft") {
      previous.click();
    }
    if (event.key === "ArrowRight") {
      next.click();
    }
  });

  render();
  queueMicrotask(() => overlay.focus());
  return overlay;
}

function openGallery(product) {
  recordProductView(product);
  trackEvent("view_item_gallery", {
    item_id: product.id,
    item_name: product.title,
    item_category: product.category,
    value: product.price,
    currency: "BRL",
  });
  document.body.append(createGallery(product));
}

function createProductCard(product) {
  const inventory = getInventory(product);
  const initialQuantity = getCartQuantity(product.id);
  const canAddInitial = inventory.stock > 0 && initialQuantity < inventory.stock;
  const cartButton = el("button", {
    className: "button button-small",
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
      recordIntentEvent("add_to_cart", { productId: product.id, location: "product_card" });
      cartButton.textContent = quantity >= inventory.stock ? "Limite no carrinho" : "Adicionado";
      cartButton.disabled = quantity >= inventory.stock;
    },
  });

  return el("article", { className: "product-card" }, [
    el("button", {
      className: "product-photo",
      type: "button",
      "aria-label": `Abrir fotos de ${product.title}`,
      onClick: () => openGallery(product),
    }, [
      product.photo ? el("img", { src: product.photo, alt: "" }) : null,
      el("span", { text: product.photoLabel }),
      el("small", { text: `${Math.min(product.gallery?.length || 1, 3)} fotos` }),
    ]),
    el("div", { className: "product-body" }, [
      el("div", { className: "product-meta" }, [
        el("span", { text: product.category }),
        el("span", { text: product.condition }),
        el("span", { text: inventory.status }),
      ]),
      el("h2", { text: product.title }),
      el("p", { className: "product-description", text: product.description }),
      el("dl", { className: "product-specs" }, [
        el("dt", { text: "Compatibilidade" }),
        el("dd", { text: product.compatibility }),
        el("dt", { text: "Código" }),
        el("dd", { text: product.partNumber }),
        el("dt", { text: "Local" }),
        el("dd", { text: product.city }),
        el("dt", { text: "Envio" }),
        el("dd", { text: product.logistics }),
      ]),
      el("div", { className: "product-footer" }, [
        el("strong", { text: formatPrice(product.price) }),
        el("div", { className: "product-actions" }, [
          cartButton,
          el("a", {
            className: "button button-small button-secondary",
            href: `/produto/${product.id}`,
            text: "Detalhes",
            onClick: (event) => {
              event.preventDefault();
              navigate(`/produto/${product.id}`);
            },
          }),
        ]),
      ]),
    ]),
  ]);
}

function createAction(action) {
  return el("a", {
    className: action.secondary ? "button button-secondary hero-cta-secondary" : "button hero-cta-primary",
    href: action.href,
    text: action.label,
    onClick: (event) => {
      event.preventDefault();
      navigate(action.href);
    },
  });
}

function filterProducts(search, category) {
  const normalizedSearch = search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = category === allCategories || product.category === category;
    const haystack = [
      product.title,
      product.category,
      product.brand,
      product.model,
      product.condition,
      product.city,
      product.compatibility,
      product.partNumber,
      product.logistics,
      product.description,
    ].join(" ").toLowerCase();

    return matchesCategory && (!normalizedSearch || haystack.includes(normalizedSearch));
  });
}

export function createProductsPage({ eyebrow, title, text, empty, actions, proofPoints, steps, cta }) {
  const grid = el("div", { className: "products-grid" });
  const count = el("p", { className: "results-count" });
  const searchInput = el("input", {
    type: "search",
    name: "busca",
    placeholder: "Motor Yamaha, hélice inox, Santos...",
    autocomplete: "off",
    "aria-label": "Buscar peças",
  });
  const categorySelect = el("select", { name: "categoria", "aria-label": "Filtrar por categoria" }, [
    el("option", { value: allCategories, text: allCategories }),
    ...categories.map((category) => el("option", { value: category, text: category })),
  ]);
  const conditionSelect = el("select", { name: "condicao", "aria-label": "Filtrar por condição" }, [
    el("option", { value: allCategories, text: "Todas" }),
    ...[...new Set(products.map((product) => product.condition))].map((condition) => (
      el("option", { value: condition, text: condition })
    )),
  ]);
  const sortSelect = el("select", { name: "ordem", "aria-label": "Ordenar produtos" }, [
    el("option", { value: "relevancia", text: "Relevância" }),
    el("option", { value: "menor-preco", text: "Menor preço" }),
    el("option", { value: "maior-preco", text: "Maior preço" }),
  ]);

  const renderList = () => {
    const filtered = filterProducts(searchInput.value, categorySelect.value).filter((product) => (
      conditionSelect.value === allCategories || product.condition === conditionSelect.value
    )).slice().sort((a, b) => {
      if (sortSelect.value === "menor-preco") {
        return a.price - b.price;
      }

      if (sortSelect.value === "maior-preco") {
        return b.price - a.price;
      }

      return 0;
    });

    count.textContent = `${filtered.length} peças encontradas`;
    grid.replaceChildren(...(filtered.length ? filtered.map(createProductCard) : [
      el("p", { className: "empty-state", text: empty }),
    ]));
  };

  let searchTimer;
  const recordSearchIntent = () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      const query = searchInput.value.trim();

      if (!query) {
        return;
      }

      const filters = {
        category: categorySelect.value,
        condition: conditionSelect.value,
        sort: sortSelect.value,
      };
      recordSearch(query, filters);
      trackEvent("search", {
        search_term: query,
        category: filters.category,
        condition: filters.condition,
        sort: filters.sort,
      });
    }, 650);
  };

  searchInput.addEventListener("input", () => {
    renderList();
    recordSearchIntent();
  });
  categorySelect.addEventListener("change", () => {
    renderList();
    recordIntentEvent("filter_change", { filter: "category", value: categorySelect.value });
  });
  conditionSelect.addEventListener("change", () => {
    renderList();
    recordIntentEvent("filter_change", { filter: "condition", value: conditionSelect.value });
  });
  sortSelect.addEventListener("change", () => {
    renderList();
    recordIntentEvent("sort_change", { value: sortSelect.value });
  });
  renderList();

  return el("main", { className: "page-shell products-page" }, [
    el("section", { className: "page-intro" }, [
      el("p", { className: "eyebrow", text: eyebrow }),
      el("h1", { text: title }),
      el("p", { className: "hero-text", text }),
      el("div", { className: "hero-actions" }, actions.map(createAction)),
      el("div", { className: "proof-strip" }, proofPoints.map((item) => (
        el("span", { text: item })
      ))),
    ]),
    el("section", { className: "search-surface", "aria-label": "Filtros de produtos" }, [
      el("label", {}, [
        el("span", { text: "Buscar" }),
        searchInput,
      ]),
      el("label", {}, [
        el("span", { text: "Categoria" }),
        categorySelect,
      ]),
      el("label", {}, [
        el("span", { text: "Condição" }),
        conditionSelect,
      ]),
      el("label", {}, [
        el("span", { text: "Ordem" }),
        sortSelect,
      ]),
      count,
    ]),
    el("section", { className: "how-it-works", "aria-label": "Como funciona" }, [
      el("div", { className: "section-heading" }, [
        el("p", { className: "eyebrow", text: "Como funciona" }),
        el("h2", { text: "Menos chute. Mais detalhe técnico." }),
      ]),
      el("div", { className: "steps-grid" }, steps.map((step, index) => (
        el("article", { className: "step-card" }, [
          el("span", { className: "step-number", text: String(index + 1).padStart(2, "0") }),
          el("h3", { text: step.title }),
          el("p", { text: step.text }),
        ])
      ))),
    ]),
    grid,
    el("section", { className: "closing-cta" }, [
      el("div", {}, [
        el("h2", { text: cta.title }),
        el("p", { text: cta.text }),
      ]),
      el("a", {
        className: "button",
        href: "/captacao",
        text: cta.action,
        onClick: (event) => {
          event.preventDefault();
          navigate("/captacao");
        },
      }),
    ]),
  ]);
}

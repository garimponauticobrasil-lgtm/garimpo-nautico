const variants = {
  promise: [
    "Peça náutica usada com conferência antes de você fechar.",
    "Encontre a peça certa sem depender de anúncio solto.",
    "Compra de peça usada com orientação técnica do Garimpo Náutico.",
  ],
  offer: [
    "Reserve a peça e confirme disponibilidade pelo WhatsApp.",
    "Coloque no carrinho e receba a confirmação de frete e compatibilidade.",
    "Separe a peça agora. A equipe confere estoque antes do pagamento.",
  ],
};

function renderVariants(name) {
  const list = document.querySelector(`[data-variant-list="${name}"]`);

  if (!list) {
    return;
  }

  list.replaceChildren(...variants[name].map((text, index) => {
    const item = document.createElement("p");
    item.className = index === 0 ? "variant is-active" : "variant";
    item.textContent = text;
    return item;
  }));
}

function randomizeVariant(name) {
  const items = [...document.querySelectorAll(`[data-variant-list="${name}"] .variant`)];
  const activeIndex = Math.floor(Math.random() * items.length);

  items.forEach((item, index) => {
    item.classList.toggle("is-active", index === activeIndex);
  });
}

function setupUtmForm() {
  const form = document.querySelector("[data-utm-form]");
  const output = document.querySelector("[data-utm-output]");

  if (!form || !output) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const url = new URL("https://garimpo-nautico.vercel.app/");

    url.searchParams.set("utm_source", data.get("source"));
    url.searchParams.set("utm_medium", "social");
    url.searchParams.set("utm_campaign", data.get("campaign"));
    url.searchParams.set("utm_content", data.get("content"));
    output.textContent = url.toString();
  });

  form.requestSubmit();
}

const identityKey = "garimpo-lab-customer";

function getFirstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

function readIdentity() {
  try {
    return JSON.parse(localStorage.getItem(identityKey) || "null");
  } catch {
    return null;
  }
}

function writeIdentity(identity) {
  localStorage.setItem(identityKey, JSON.stringify(identity));
}

function renderGreeting() {
  const preview = document.querySelector("[data-greeting-preview]");
  const identity = readIdentity();

  if (!preview) {
    return;
  }

  const title = preview.querySelector("strong");
  const detail = preview.querySelector("span");

  if (!identity?.firstName) {
    title.textContent = "Olá! Encontre a peça certa para o seu barco.";
    detail.textContent = "Sem cliente reconhecido neste navegador.";
    return;
  }

  title.textContent = `Olá, ${identity.firstName}. Bom te ver de volta.`;
  detail.textContent = `Contato salvo: ${identity.contact}. A saudação pode aparecer na home, no carrinho e no atendimento.`;
}

function setupIdentityExperiment() {
  const form = document.querySelector("[data-identity-form]");
  const clearButton = document.querySelector("[data-clear-identity]");

  if (!form) {
    return;
  }

  const identity = readIdentity();

  if (identity) {
    form.elements.name.value = identity.name || "";
    form.elements.contact.value = identity.contact || "";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get("name");
    const contact = data.get("contact");

    writeIdentity({
      name,
      firstName: getFirstName(name),
      contact,
      source: "marketing-lab",
      savedAt: new Date().toISOString(),
    });
    renderGreeting();
  });

  clearButton?.addEventListener("click", () => {
    localStorage.removeItem(identityKey);
    form.reset();
    renderGreeting();
  });

  renderGreeting();
}

Object.keys(variants).forEach(renderVariants);
document.querySelectorAll("[data-randomize]").forEach((button) => {
  button.addEventListener("click", () => randomizeVariant(button.dataset.randomize));
});
setupUtmForm();
setupIdentityExperiment();

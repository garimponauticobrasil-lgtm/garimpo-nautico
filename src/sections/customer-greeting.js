import { clearCustomer, readCustomer, saveCustomer } from "../lib/customer.js";
import { el } from "../lib/dom.js";

export function createCustomerGreeting() {
  const title = el("strong");
  const detail = el("span");
  const nameInput = el("input", {
    autocomplete: "given-name",
    name: "name",
    placeholder: "Seu nome",
    required: true,
    type: "text",
  });
  const contactInput = el("input", {
    autocomplete: "tel",
    name: "contact",
    placeholder: "WhatsApp ou e-mail",
    required: true,
    type: "text",
  });
  const quickForm = el("form", {
    className: "customer-greeting__form",
    onSubmit: (event) => {
      event.preventDefault();
      const customer = saveCustomer({
        name: nameInput.value,
        contact: contactInput.value,
        source: "first-visit",
      });

      if (customer) {
        nameInput.value = "";
        contactInput.value = "";
        render();
      }
    },
  }, [
    nameInput,
    contactInput,
    el("button", { type: "submit", text: "Salvar" }),
  ]);
  const clearButton = el("button", {
    className: "customer-greeting__clear",
    type: "button",
    text: "Não sou eu",
    onClick: () => {
      clearCustomer();
      render();
    },
  });
  const greeting = el("aside", { className: "customer-greeting", hidden: true }, [
    el("div", {}, [title, detail]),
    quickForm,
    clearButton,
  ]);

  const render = () => {
    const customer = readCustomer();

    greeting.hidden = false;
    quickForm.hidden = Boolean(customer?.firstName);
    clearButton.hidden = !customer?.firstName;

    if (!customer?.firstName) {
      title.textContent = "Olá.";
      detail.textContent = "Como devo lhe chamar?";
      return;
    }

    title.textContent = `Olá, ${customer.firstName}.`;
    detail.textContent = "Bom te ver de volta ao Garimpo Náutico.";
  };

  window.addEventListener("garimpo:customer-change", render);
  window.addEventListener("storage", render);
  render();

  return greeting;
}

import { saveCustomer } from "../lib/customer.js";
import { trackEvent } from "../lib/analytics.js";
import { el } from "../lib/dom.js";
import { markConverted, recordIntentEvent } from "../lib/visitor-intent.js";

function createField(label, control) {
  return el("label", { className: "form-field" }, [
    el("span", { text: label }),
    control,
  ]);
}

function createInput(name, placeholder, type = "text") {
  return el("input", {
    autocomplete: type === "tel" ? "tel" : "on",
    name,
    placeholder,
    required: true,
    type,
  });
}

function createSelect(name, options) {
  return el("select", { name, required: true }, options.map((option) => (
    el("option", { value: option, text: option })
  )));
}

function getFormData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function validatePhone(value) {
  return value.replace(/\D/g, "").length >= 10;
}

export function createLeadPage({
  eyebrow,
  title,
  text,
  privacy,
  success,
  trustTitle,
  trustItems,
  formTitle,
  formHint,
}) {
  const status = el("p", { className: "form-status", role: "status", "aria-live": "polite" });
  const form = el("form", {
    className: "lead-form",
    noValidate: true,
    onSubmit: (event) => {
      event.preventDefault();
      const data = getFormData(event.currentTarget);

      if (!validatePhone(data.whatsapp || "")) {
        status.textContent = "Informe um WhatsApp com DDD para continuar.";
        status.setAttribute("data-state", "error");
        return;
      }

      saveCustomer({
        name: data.nome,
        contact: data.whatsapp,
        source: "lead-form",
      });
      trackEvent("lead_submit", {
        lead_type: data.objetivo,
        product_interest: data.peca,
        urgency: data.urgencia,
        city: data.local,
      });
      recordIntentEvent("lead_submit", {
        objetivo: data.objetivo,
        peca: data.peca,
        urgencia: data.urgencia,
      });
      markConverted("lead");
      event.currentTarget.reset();
      status.textContent = success;
      status.setAttribute("data-state", "success");
    },
  }, [
    el("div", { className: "form-heading" }, [
      el("h2", { text: formTitle }),
      el("p", { text: formHint }),
    ]),
    el("div", { className: "intent-toggle", role: "radiogroup", "aria-label": "Objetivo" }, [
      el("label", {}, [
        el("input", { checked: true, name: "objetivo", type: "radio", value: "comprar" }),
        el("span", { text: "Quero consultar uma peça" }),
      ]),
      el("label", {}, [
        el("input", { name: "objetivo", type: "radio", value: "oferecer" }),
        el("span", { text: "Quero oferecer para avaliação" }),
      ]),
    ]),
    createField("Nome", createInput("nome", "Seu nome")),
    createField("WhatsApp", createInput("whatsapp", "(00) 00000-0000", "tel")),
    createField("Cidade e estado", createInput("local", "Ex.: Santos, SP")),
    createField("Tipo de peça", createInput("peca", "Ex.: rabeta, hélice, painel, motor de popa")),
    createField("Marca, modelo ou HP", createInput("modelo", "Ex.: Mercury 150HP, Yamaha 15HP")),
    createField("Código/OEM, se tiver", el("input", {
      autocomplete: "off",
      name: "codigo",
      placeholder: "Ex.: 420664946, 6E7-W0070",
      type: "text",
    })),
    createField("Embarcação ou motor", el("input", {
      autocomplete: "on",
      name: "embarcacao",
      placeholder: "Ex.: Focker 210, Volvo D3, Sea-Doo RXP",
      type: "text",
    })),
    createField("Urgência", createSelect("urgencia", [
      "Estou pesquisando",
      "Preciso cotar esta semana",
      "Barco parado",
    ])),
    createField("Detalhes", el("textarea", {
      name: "detalhes",
      placeholder: "Ano, estado da peça, compatibilidade, fotos disponíveis ou detalhe de envio",
      rows: "5",
    })),
    el("p", { className: "privacy-note", text: privacy }),
    el("button", { className: "button", type: "submit", text: "Enviar solicitação" }),
    status,
  ]);

  return el("main", { className: "page-shell lead-page" }, [
    el("section", { className: "page-intro lead-intro" }, [
      el("p", { className: "eyebrow", text: eyebrow }),
      el("h1", { text: title }),
      el("p", { className: "hero-text", text }),
    ]),
    el("section", { className: "lead-layout" }, [
      el("aside", { className: "trust-panel" }, [
        el("p", { className: "panel-kicker", text: "Atendimento" }),
        el("h2", { text: trustTitle }),
        el("ul", {}, trustItems.map((item) => el("li", { text: item }))),
      ]),
      form,
    ]),
  ]);
}

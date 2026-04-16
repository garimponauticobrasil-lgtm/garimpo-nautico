import { el } from "../lib/dom.js";

export function createPrivacyPage() {
  return el("main", { className: "page-shell privacy-page" }, [
    el("section", { className: "page-intro" }, [
      el("p", { className: "eyebrow", text: "Privacidade" }),
      el("h1", { text: "Dados claros para atendimento melhor." }),
      el("p", {
        className: "hero-text",
        text: "O Garimpo N\u00e1utico usa dados apenas para operar o site, responder solicita\u00e7\u00f5es e anunciar produtos para quem autorizou cookies de marketing.",
      }),
    ]),
    el("section", { className: "privacy-content" }, [
      el("h2", { text: "O que coletamos" }),
      el("p", {
        text: "Quando voc\u00ea navega, podemos registrar dados t\u00e9cnicos do acesso, p\u00e1ginas visitadas, buscas feitas no cat\u00e1logo, produtos visualizados e itens adicionados ao carrinho.",
      }),
      el("p", {
        text: "Quando voc\u00ea envia formul\u00e1rio, carrinho ou WhatsApp, usamos nome, cidade, contato e detalhes da pe\u00e7a para retornar sobre produtos n\u00e1uticos.",
      }),
      el("h2", { text: "Cookies e an\u00fancios" }),
      el("p", {
        text: "Cookies essenciais ficam ativos para carrinho e funcionamento do site. Cookies de medi\u00e7\u00e3o e marketing s\u00f3 devem ser usados ap\u00f3s sua autoriza\u00e7\u00e3o.",
      }),
      el("p", {
        text: "Com consentimento, podemos usar Google Tag Manager, Google Ads e Meta Pixel para medir resultados e criar p\u00fablicos de remarketing.",
      }),
      el("h2", { text: "Limites" }),
      el("p", {
        text: "N\u00e3o tentamos descobrir a identidade de visitantes an\u00f4nimos, acessar redes sociais pessoais ou rastrear pesquisas fora do site sem autoriza\u00e7\u00e3o.",
      }),
      el("h2", { text: "Seus pedidos" }),
      el("p", {
        text: "Voc\u00ea pode pedir atualiza\u00e7\u00e3o, exclus\u00e3o ou informa\u00e7\u00f5es sobre seus dados pelo canal de atendimento informado no site.",
      }),
    ]),
  ]);
}

import { el } from "../lib/dom.js";

export function createPrivacyPage() {
  return el("main", { className: "page-shell privacy-page" }, [
    el("section", { className: "page-intro" }, [
      el("p", { className: "eyebrow", text: "Privacidade" }),
      el("h1", { text: "Dados claros para atendimento melhor." }),
      el("p", {
        className: "hero-text",
        text: "O Garimpo Nautico usa dados apenas para operar o site, responder solicitacoes e anunciar produtos para quem autorizou cookies de marketing.",
      }),
    ]),
    el("section", { className: "privacy-content" }, [
      el("h2", { text: "O que coletamos" }),
      el("p", {
        text: "Quando voce navega, podemos registrar dados tecnicos do acesso, paginas visitadas, buscas feitas no catalogo, produtos visualizados e itens adicionados ao carrinho.",
      }),
      el("p", {
        text: "Quando voce envia formulario, carrinho ou WhatsApp, usamos nome, cidade, contato e detalhes da peca para retornar sobre produtos nauticos.",
      }),
      el("h2", { text: "Cookies e anuncios" }),
      el("p", {
        text: "Cookies essenciais ficam ativos para carrinho e funcionamento do site. Cookies de medicao e marketing so devem ser usados apos sua autorizacao.",
      }),
      el("p", {
        text: "Com consentimento, podemos usar Google Tag Manager, Google Ads e Meta Pixel para medir resultados e criar publicos de remarketing.",
      }),
      el("h2", { text: "Limites" }),
      el("p", {
        text: "Nao tentamos descobrir a identidade de visitantes anonimos, acessar redes sociais pessoais ou rastrear pesquisas fora do site sem autorizacao.",
      }),
      el("h2", { text: "Seus pedidos" }),
      el("p", {
        text: "Voce pode pedir atualizacao, exclusao ou informacoes sobre seus dados pelo canal de atendimento informado no site.",
      }),
    ]),
  ]);
}

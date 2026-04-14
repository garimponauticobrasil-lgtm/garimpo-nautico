const DISMISS_KEY = "garimpoInstallPromptDismissedAt";
const DISMISS_DAYS = 7;
const PROMPT_DELAY = 12000;

let deferredPrompt = null;
let promptNode = null;
let hasShownPrompt = false;

function isMobileViewport() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function wasRecentlyDismissed() {
  const value = window.localStorage.getItem(DISMISS_KEY);

  if (!value) {
    return false;
  }

  const dismissedAt = Number(value);
  const maxAge = DISMISS_DAYS * 24 * 60 * 60 * 1000;

  return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < maxAge;
}

function rememberDismissal() {
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

function canShowPrompt() {
  return isMobileViewport() && !isStandalone() && !hasShownPrompt && !wasRecentlyDismissed();
}

function removePrompt() {
  promptNode?.remove();
  promptNode = null;
}

function showManualInstructions(statusNode) {
  statusNode.textContent =
    "No Android, abra o menu do navegador e toque em Adicionar \u00e0 tela inicial. No iPhone, toque em Compartilhar e escolha Adicionar \u00e0 Tela de In\u00edcio.";
}

function createPrompt(logo) {
  const prompt = document.createElement("aside");
  const icon = document.createElement("img");
  const copy = document.createElement("div");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h2");
  const text = document.createElement("p");
  const statusNode = document.createElement("p");
  const actions = document.createElement("div");
  const installButton = document.createElement("button");
  const dismissButton = document.createElement("button");

  prompt.className = "install-prompt";
  prompt.setAttribute("role", "dialog");
  prompt.setAttribute("aria-label", "Criar atalho do Garimpo N\u00e1utico");

  icon.className = "install-prompt__icon";
  icon.src = logo;
  icon.alt = "";

  copy.className = "install-prompt__copy";

  eyebrow.className = "install-prompt__eyebrow";
  eyebrow.textContent = "Antes de sair";

  title.textContent = "Deixe o Garimpo N\u00e1utico na tela inicial.";
  text.textContent =
    "Crie um atalho com a nossa logo e volte direto para consultar pe\u00e7as usadas n\u00e1uticas. O cadastro continua sendo feito no site.";

  statusNode.className = "install-prompt__status";
  statusNode.setAttribute("aria-live", "polite");

  actions.className = "install-prompt__actions";

  installButton.className = "button install-prompt__install";
  installButton.type = "button";
  installButton.textContent = "Criar atalho";

  dismissButton.className = "install-prompt__dismiss";
  dismissButton.type = "button";
  dismissButton.textContent = "Agora n\u00e3o";

  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) {
      showManualInstructions(statusNode);
      return;
    }

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;

    if (result.outcome === "accepted") {
      removePrompt();
      return;
    }

    showManualInstructions(statusNode);
  });

  dismissButton.addEventListener("click", () => {
    rememberDismissal();
    removePrompt();
  });

  copy.append(eyebrow, title, text, statusNode);
  actions.append(installButton, dismissButton);
  prompt.append(icon, copy, actions);

  return prompt;
}

function showPrompt(logo) {
  if (!canShowPrompt() || promptNode) {
    return;
  }

  hasShownPrompt = true;
  promptNode = createPrompt(logo);
  document.body.append(promptNode);
}

function schedulePrompt(logo) {
  window.setTimeout(() => showPrompt(logo), PROMPT_DELAY);
}

export function setupInstallPrompt({ logo }) {
  if (!("localStorage" in window)) {
    return;
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    schedulePrompt(logo);
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    removePrompt();
  });

  schedulePrompt(logo);
}

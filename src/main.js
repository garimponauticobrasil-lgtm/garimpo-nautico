import { renderApp } from "./app.js";
import { content } from "./lib/content.js";
import { setupInstallPrompt } from "./lib/install-prompt.js";

renderApp(document.querySelector("#app"));
setupInstallPrompt({ logo: content.header.logo });

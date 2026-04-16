import { renderApp } from "./app.js";
import { initAnalytics } from "./lib/analytics.js";
import { content } from "./lib/content.js";
import { setupInstallPrompt } from "./lib/install-prompt.js";
import { captureAttribution } from "./lib/visitor-intent.js";

initAnalytics();
captureAttribution();
renderApp(document.querySelector("#app"));
setupInstallPrompt({ logo: content.header.logo });

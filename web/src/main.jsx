import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AppProvider } from "./store.jsx";
import "./base.css";
import "./app.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><AppProvider><App /></AppProvider></StrictMode>
);

/* Offline support: register the service worker (skipped inside claude.ai previews and the dev server). */
if ("serviceWorker" in navigator && import.meta.env.PROD && !/claude/i.test(location.hostname)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => { /* offline support unavailable */ });
  });
}

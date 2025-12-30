import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Only register service worker if PWA is enabled (not disabled via VITE_DISABLE_PWA)
if (import.meta.env.PROD) {
  // Dynamic import to avoid build errors when PWA is disabled
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          updateSW(true);
        },
      });
    })
    .catch(() => {
      // PWA not available (disabled via VITE_DISABLE_PWA)
    });
}

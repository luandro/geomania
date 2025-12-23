import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Base path for GitHub Pages deployment (defaults to / for local dev)
  const base = process.env.VITE_BASE_PATH || "/";
  const basePath = base.endsWith("/") ? base : `${base}/`;

  return {
    base,
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png", "kuromi.svg", "kuromi_map.svg"],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,webmanifest}"],
        navigateFallback: `${basePath}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith("/data-version.json"),
            handler: "NetworkFirst",
            options: {
              cacheName: "geomania-data-version",
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes("/flags/"),
            handler: "CacheFirst",
            options: {
              cacheName: "geomania-flags",
              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes("/data/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "geomania-data",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});

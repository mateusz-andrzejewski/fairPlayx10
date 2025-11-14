// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import { cloudflarePolyfills } from "./src/lib/vite-plugins/cloudflare-polyfills.ts";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss(), cloudflarePolyfills()],
    resolve: {
      // Fix for React 19 + Cloudflare Workers: use edge renderer to avoid MessageChannel error
      alias: import.meta.env.PROD && {
        'react-dom/server': 'react-dom/server.edge',
      },
    },
    ssr: {
      external: [],
      noExternal: [],
    },
  },
  adapter: cloudflare({
    imageService: 'cloudflare',
    platformProxy: {
      enabled: false, // Disable miniflare in dev mode (causes crashes on Windows)
    },
  }),
});

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
    ssr: {
      external: [],
      noExternal: [],
    },
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    runtime: {
      mode: 'local',
      type: 'pages',
    },
    imageService: 'cloudflare',
  }),
});

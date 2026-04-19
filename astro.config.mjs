import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const defaultSite = "https://ai-signal-archive.workers.dev";
const publicBasePath = process.env.PUBLIC_BASE_PATH ?? "/";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? defaultSite,
  base: publicBasePath,
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
        "@data": new URL("./data", import.meta.url).pathname,
        "@scripts": new URL("./scripts", import.meta.url).pathname
      }
    }
  }
});

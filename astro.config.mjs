import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

export default defineConfig({
  site: "https://hameds.net",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [pagefind()],
});

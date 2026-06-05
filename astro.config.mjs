import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://hameds.net",
  trailingSlash: "never",
  build: {
    format: "file",
  },
});

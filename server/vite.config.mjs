import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/postcss";

export default defineConfig({
  publicDir: false,
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  build: {
    outDir: "public/assets",
    emptyOutDir: false,
    rollupOptions: {
      input: "src/docs/views/main.css",
      output: {
        assetFileNames: "main.css",
      },
    },
  },
});

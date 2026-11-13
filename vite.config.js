import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built game run from any sub-folder or inside a portal iframe.
export default defineConfig({
  base: "./",
  plugins: [react()],
  // three.js alone is ~700 kB minified (~200 kB gzipped); that's expected.
  build: { chunkSizeWarningLimit: 900 },
});

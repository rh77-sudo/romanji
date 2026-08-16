import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  resolve: {
    alias: {
      // kuromoji DictionaryLoader calls path.join in the browser
      path: "path-browserify",
      // zlibjs assumes `this === window`; Vite modules make `this` undefined
      "zlibjs/bin/gunzip.min.js": fileURLToPath(new URL("./src/zlib-shim.cjs", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ["kuroshiro", "kuroshiro-analyzer-kuromoji", "kuromoji"],
  },
  test: {
    environment: "happy-dom",
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import wasm from "vite-plugin-wasm";
import rollupNodePolyFill from "rollup-plugin-polyfill-node";

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    {
      ...rollupNodePolyFill(),
      enforce: "post",
    },
  ],
  base: "/",
  define: {
    global: "globalThis", // ✅ Needed for some crypto libs
    "process.env": {},
  },
  resolve: {
    alias: {
      buffer: "buffer", // ✅ Required for bip32/bip39 in browser
      assert: "assert",
    },
  },
  build: {
    target: "esnext", // ← enable support for top-level await
  },
  optimizeDeps: {
    include: ["buffer"], // ✅ Ensure Buffer is pre-bundled
    exclude: ["lucide-react"], // ✅ Your preference
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
});

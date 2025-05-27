import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { resolve } from "path";
import vsixPlugin from "@codingame/monaco-vscode-rollup-vsix-plugin";
import importMetaUrlPlugin from "@codingame/esbuild-import-meta-url-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    vsixPlugin(), // See https://github.com/CodinGame/monaco-vscode-api?tab=readme-ov-file#loading-vsix-file
  ],
  worker: {
    format: "es",
    plugins: () => [wasm(), topLevelAwait()],
  },
  build: {
    minify: "terser",
    terserOptions: {
      parse: {
        html5_comments: false,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        evonne: resolve(__dirname, "evonne.html"),
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [importMetaUrlPlugin as any], // See https://github.com/CodinGame/monaco-vscode-api
    },
  },
});

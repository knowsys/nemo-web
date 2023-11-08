import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    monacoEditorPlugin.default({
      languageWorkers: ["editorWorkerService"],
    }),
  ],
  worker: {
    format: "es",
    plugins: [wasm(), topLevelAwait()],
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
  },
});

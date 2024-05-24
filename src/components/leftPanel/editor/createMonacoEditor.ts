import getExtensionGalleryServiceOverride from "@codingame/monaco-vscode-extension-gallery-service-override";
import type { WorkerConfig } from "@codingame/monaco-vscode-extensions-service-override";
import getExtensionServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getOutlineServiceOverride from "@codingame/monaco-vscode-outline-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import { createConfiguredEditor } from "vscode/monaco";
import { initialize as initializeMonacoService } from "vscode/services";
import { Worker } from "./monacoFakeWorker.ts";
import * as monaco from "monaco-editor";

// See https://github.com/CodinGame/monaco-vscode-api?tab=readme-ov-file#loading-vsix-file
// @ts-ignore
import "../../../../nemoVSIX/nemo.vsix";

const fakeWorker = new Worker(
  new URL("vscode/workers/extensionHost.worker", import.meta.url),
  { type: "module" },
);

export const workerConfig: WorkerConfig = {
  url: fakeWorker.url.toString(),
  options: fakeWorker.options,
};

let servicesInitialized = false;

export async function createEditor(
  container: HTMLElement,
  programText: string,
  additionalMonacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions,
) {
  // See https://github.com/CodinGame/monaco-vscode-api/blob/main/demo/src/setup.workbench.ts

  if (!servicesInitialized) {
    servicesInitialized = true;
    await initializeMonacoService(
      {
        ...getExtensionGalleryServiceOverride({ webOnly: true }),
        ...getExtensionServiceOverride(workerConfig),
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getOutlineServiceOverride(),
        ...getLanguagesServiceOverride(),
      },
      container,
      {},
      {},
    );
  }

  const editor = createConfiguredEditor(container, {
    value: programText,
    language: "nemo",
    automaticLayout: true,
    minimap: {
      autohide: true,
      ...additionalMonacoOptions?.minimap,
    },
    ...additionalMonacoOptions,
  });

  // @ts-ignore
  editor.getModel().setLanguage("nemo");

  return editor;
}

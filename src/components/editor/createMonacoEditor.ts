// THE WHOLE FILE IS NOW HEAVILY BASED ON
// https://github.com/CodinGame/monaco-vscode-api/blob/74f56d38c9481b2fafa18ff3597da39811375f5c/demo/src/setup.common.ts
// THE DOCUMENTATION ON THE OTHER HAND DOES NOT SEEM TO BE UP TO DATE IN SOM CRITICAL PLACES FOR EXAMPLE FOR THE EXTENSION HOST
// IT MIGHT STILL BE HELPFUL TO GET A GENERAL OVERVIEW OF THE SETUP
// https://github.com/CodinGame/monaco-vscode-api/wiki/Getting-started-guide

// default monaco-editor imports
import * as monaco from "monaco-editor";

import { initialize } from "@codingame/monaco-vscode-api";
import getConfigurationServiceOverride, {
  initUserConfiguration,
  updateUserConfiguration,
} from "@codingame/monaco-vscode-configuration-service-override";
import getExtensionServiceOverride from "@codingame/monaco-vscode-extensions-service-override";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextMateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";

import "@codingame/monaco-vscode-theme-defaults-default-extension";

// See https://github.com/CodinGame/monaco-vscode-api?tab=readme-ov-file#loading-vsix-file
// @ts-ignore
import "../../../nemoVSIX/nemo.vsix";

import { Worker } from "./monacoFakeWorker.ts";

const workers: Partial<Record<string, Worker>> = {
  editorWorkerService: new Worker(
    new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url),
    { type: "module" },
  ),
  extensionHostWorkerMain: new Worker(
    new URL(
      "@codingame/monaco-vscode-api/workers/extensionHost.worker",
      import.meta.url,
    ),
    { type: "module" },
  ),
  TextMateWorker: new Worker(
    new URL(
      "@codingame/monaco-vscode-textmate-service-override/worker",
      import.meta.url,
    ),
    { type: "module" },
  ),
};

// The approach from the docs using `getWorker` does not work for the extensionHostWorkerMain even though the error message says it should...
// Anyway, as stated above, this is what we found in
// https://github.com/CodinGame/monaco-vscode-api/blob/74f56d38c9481b2fafa18ff3597da39811375f5c/demo/src/setup.common.ts
// and it seems to work.
window.MonacoEnvironment = {
  getWorkerUrl(_, label) {
    return workers[label]?.url.toString();
  },
  getWorkerOptions(_, label) {
    return workers[label]?.options;
  },
};

let servicesInitialized: Promise<void> | undefined;

export async function changeTheme(dark: boolean) {
  await updateUserConfiguration(
    JSON.stringify({
      "workbench.colorTheme": dark ? "Dark Modern" : "Light Modern",
    }),
  );
}

/**
 * Initializes the editor services, once for all editors
 */
export function initializeServices(container: HTMLElement, darkMode: boolean) {
  servicesInitialized ??= initializeServicesOnce(container, darkMode);
  return servicesInitialized;
}

async function initializeServicesOnce(
  container: HTMLElement,
  darkMode: boolean,
) {
  await initUserConfiguration(
    JSON.stringify({
      "workbench.colorTheme": darkMode ? "Dark Modern" : "Light Modern",
    }),
  );

  await initialize(
    {
      ...getConfigurationServiceOverride(),
      ...getExtensionServiceOverride({ enableWorkerExtensionHost: true }),
      ...getLanguagesServiceOverride(),
      ...getThemeServiceOverride(),
      ...getTextMateServiceOverride(),
    },
    container,
  );
}

/**
 * A text the language server sees under a URI
 *
 * A `file:` URI gives a Nemo program a directory, against which the language server
 * resolves its `@use` directives: to the other open models in that directory.
 */
export interface ModelText {
  uri: string;
  text: string;
  language: string;
}

/**
 * Returns the model of a text, created or, if it exists, updated to the text
 */
export function openModel({ uri, text, language }: ModelText) {
  const parsedUri = monaco.Uri.parse(uri);
  const existing = monaco.editor.getModel(parsedUri);
  if (existing === null) {
    return monaco.editor.createModel(text, language, parsedUri);
  }
  if (existing.getValue() !== text) {
    existing.setValue(text);
  }
  return existing;
}

export function createEditor(
  container: HTMLElement,
  model: monaco.editor.ITextModel,
  additionalMonacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions,
) {
  return monaco.editor.create(container, {
    model,
    ...additionalMonacoOptions,
  });
}

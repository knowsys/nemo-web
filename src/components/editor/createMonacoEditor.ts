// THE WHOLE FILE IS NOW HEAVILY BASED ON 
// https://github.com/CodinGame/monaco-vscode-api/blob/74f56d38c9481b2fafa18ff3597da39811375f5c/demo/src/setup.common.ts
// THE DOCUMENTATION ON THE OTHER HAND DOES NOT SEEM TO BE UP TO DATE IN SOM CRITICAL PLACES FOR EXAMPLE FOR THE EXTENSION HOST
// IT MIGHT STILL BE HELPFUL TO GET A GENERAL OVERVIEW OF THE SETUP
// https://github.com/CodinGame/monaco-vscode-api/wiki/Getting-started-guide

// default monaco-editor imports
import * as monaco from 'monaco-editor';

import { initialize } from '@codingame/monaco-vscode-api';
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
  editorWorkerService: new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
  extensionHostWorkerMain: new Worker(new URL('@codingame/monaco-vscode-api/workers/extensionHost.worker', import.meta.url), { type: 'module' }),
  TextMateWorker: new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' }),
}

// The approach from the docs using `getWorker` doe for some reason not work for the extensionHostWorkerMain even though the error message says it should...
// Anyway, as stated above, this is what we found in 
// https://github.com/CodinGame/monaco-vscode-api/blob/74f56d38c9481b2fafa18ff3597da39811375f5c/demo/src/setup.common.ts
// and it seems to work.
window.MonacoEnvironment = {
  getWorkerUrl(_, label) {
    return workers[label]?.url.toString()
  },
  getWorkerOptions(_, label) {
    return workers[label]?.options
  }
}

let servicesInitialized = false;

export async function createEditor(
  container: HTMLElement,
  programText: string,
  additionalMonacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions,
) {
  if (!servicesInitialized) {
    servicesInitialized = true;
    await initialize(
      {
        ...getExtensionServiceOverride({enableWorkerExtensionHost: true}),
        ...getLanguagesServiceOverride(),
        ...getThemeServiceOverride(),
        ...getTextMateServiceOverride(),
      },
      container,
    );
  }
  
  return monaco.editor.create(container, {
    value: programText,
    language: "nemo",
    ...additionalMonacoOptions,
  });
}


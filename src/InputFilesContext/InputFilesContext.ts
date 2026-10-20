import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { moduleNameOf } from "../moduleNameOf";

/**
 * A local file the program can read
 *
 * Imports read it by its `resource` name. A file whose name ends in `.rls` is a module instead,
 * which `@use` reads by its module name (see `moduleNameOf`).
 */
export interface InputFile {
  resource: string;
  file: File;
  /** The text of a module, read when the file is added, against which the editor checks the program */
  moduleText?: string;
}

/**
 * Returns the input file of a resource, with the text of a module read
 */
export async function inputFileOf(
  resource: string,
  file: File,
): Promise<InputFile> {
  if (moduleNameOf(resource) === undefined) {
    return { resource, file };
  }
  return { resource, file, moduleText: await file.text() };
}

/**
 * The input files of the program in the editor, shared by the execution panel and the examples
 */
export interface InputFiles {
  inputs: InputFile[];
  setInputs: Dispatch<SetStateAction<InputFile[]>>;
}

export const InputFilesContext = createContext<InputFiles | null>(null);

export function useInputFiles() {
  const inputFiles = useContext(InputFilesContext);
  if (inputFiles === null) {
    throw new Error("useInputFiles is used outside of an InputFilesProvider");
  }
  return inputFiles;
}

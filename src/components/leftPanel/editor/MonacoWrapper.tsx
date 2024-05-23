import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import "./MonacoWrapper.css";
import { createEditor } from "./createMonacoEditor";

export interface MonacoWrapperProps {
  additionalMonacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions;
  programText: string;
  onProgramTextChange?: (programText: string) => void;
}

/**
 * See https://microsoft.github.io/monaco-editor/typedoc
 * See https://microsoft.github.io/monaco-editor/playground.html
 */
export function MonacoWrapper({
  additionalMonacoOptions,
  programText,
  onProgramTextChange,
}: MonacoWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // Create editor if container is available
    if (containerRef === null || containerRef.current === null) {
      return;
    }

    const child = document.createElement("div");
    containerRef.current.replaceChildren(child);

    let changeEvent: any | undefined;
    let editor: monaco.editor.IStandaloneCodeEditor | undefined;
    let cleanedUp = false;

    const timeout = setTimeout(async function () {
      console.debug("[Editor] Creating Monaco editor");
      editor = await createEditor(child, programText, additionalMonacoOptions);
      console.debug("[Editor] Created Monaco editor", editor);

      if (cleanedUp) {
        editor.dispose();
        return;
      }

      editorRef.current = editor!;

      // Update Redux state when editor contents change
      changeEvent = editor!.onDidChangeModelContent(() => {
        if (onProgramTextChange !== undefined) {
          onProgramTextChange(editor!.getValue());
        }
      });
    }, 0);

    return () => {
      // Clean up the editor
      console.debug("[Editor] Disposing Monaco editor");

      clearTimeout(timeout);
      cleanedUp = true;
      changeEvent?.dispose();
      editor?.dispose();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update editor contents when Redux state changes
  useEffect(() => {
    const editor = editorRef.current;
    if (editor === null) {
      return;
    }

    const model = editor.getModel();
    if (model === null) {
      return;
    }

    if (editor.getValue() == programText) {
      return;
    }

    // Add new text to undo history
    editor.pushUndoStop();
    model.pushEditOperations(
      editor.getSelections(),
      [
        {
          range: model.getFullModelRange(),
          text: programText,
        },
      ],
      () => null,
    );
  }, [programText]);

  return <div className="monaco-wrapper-container" ref={containerRef}></div>;
}

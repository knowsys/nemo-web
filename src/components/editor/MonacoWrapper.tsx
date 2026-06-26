import * as monaco from "monaco-editor";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "./MonacoWrapper.css";
import { createEditor, changeTheme } from "./createMonacoEditor";

export interface MonacoWrapperImperativeHandle {
  jumpToLine: (lineToJumoTo: number) => void;
}

export interface MonacoWrapperProps {
  additionalMonacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions;
  darkMode: boolean;
  programText: string;
  onProgramTextChange?: (programText: string) => void;
}

/**
 * See https://microsoft.github.io/monaco-editor/typedoc
 * See https://microsoft.github.io/monaco-editor/playground.html
 */
export const MonacoWrapper = forwardRef(
  (
    {
      additionalMonacoOptions,
      darkMode,
      programText,
      onProgramTextChange,
    }: MonacoWrapperProps,
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        jumpToLine(lineToJumpTo: number) {
          editorRef.current?.revealLineInCenter(lineToJumpTo);
          editorRef.current?.setSelection({
            startLineNumber: lineToJumpTo,
            startColumn: 0,
            endLineNumber: lineToJumpTo + 1,
            endColumn: 0,
          });
        },
      }),
      [],
    );

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
        editor = await createEditor(
          child,
          darkMode,
          programText,
          additionalMonacoOptions,
        );
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

    // Update editor theme when Redux state changes
    useEffect(() => {
      const editor = editorRef.current;
      if (editor === null) {
        return;
      }

      changeTheme(darkMode);
    }, [darkMode]);

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
  },
);

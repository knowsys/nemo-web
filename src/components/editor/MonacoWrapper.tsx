import * as monaco from "monaco-editor";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import "./MonacoWrapper.css";
import {
  createEditor,
  changeTheme,
  initializeServices,
  ModelText,
  openModel,
} from "./createMonacoEditor";

export interface MonacoWrapperImperativeHandle {
  jumpToLine: (lineToJumoTo: number) => void;
}

export interface MonacoWrapperProps {
  additionalMonacoOptions?: monaco.editor.IStandaloneEditorConstructionOptions;
  darkMode: boolean;
  /** The URI of the edited text, fixed for the lifetime of the editor */
  uri: string;
  /** The language of the edited text, fixed for the lifetime of the editor */
  language?: string;
  programText: string;
  onProgramTextChange?: (programText: string) => void;
  /** Texts the language server sees beside the edited one, such as the modules it uses */
  companions?: ModelText[];
}

/**
 * Brings the hidden models of companion texts in line with `companions`,
 * disposing the models of companions that are gone
 *
 * A companion under the URI of the edited text is left out.
 */
function syncCompanions(
  models: Map<string, monaco.editor.ITextModel>,
  companions: ModelText[],
  uri: string,
) {
  companions = companions.filter((companion) => companion.uri !== uri);
  const wanted = new Set(companions.map((companion) => companion.uri));
  for (const [uri, model] of models) {
    if (!wanted.has(uri)) {
      model.dispose();
      models.delete(uri);
    }
  }
  for (const companion of companions) {
    models.set(companion.uri, openModel(companion));
  }
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
      uri,
      language = "nemo",
      programText,
      onProgramTextChange,
      companions = [],
    }: MonacoWrapperProps,
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const companionModelsRef = useRef(
      new Map<string, monaco.editor.ITextModel>(),
    );
    // The editor is created asynchronously, from the props of that moment
    const programTextRef = useRef(programText);
    programTextRef.current = programText;
    const companionsRef = useRef(companions);
    companionsRef.current = companions;
    const [isEditorCreated, setIsEditorCreated] = useState(false);

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
      let model: monaco.editor.ITextModel | undefined;
      const companionModels = companionModelsRef.current;
      let cleanedUp = false;

      const timeout = setTimeout(async function () {
        console.debug("[Editor] Creating Monaco editor");
        await initializeServices(child, darkMode);
        if (cleanedUp) {
          return;
        }
        // The companions open first, so that the first check of the text sees them
        syncCompanions(companionModels, companionsRef.current, uri);
        model = openModel({ uri, text: programTextRef.current, language });
        editor = createEditor(child, model, additionalMonacoOptions);
        console.debug("[Editor] Created Monaco editor", editor);

        editorRef.current = editor!;
        setIsEditorCreated(true);

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
        model?.dispose();
        syncCompanions(companionModels, [], uri);
        editorRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update the companion models when they change, before the text below
    useEffect(() => {
      if (!isEditorCreated) {
        return;
      }
      syncCompanions(companionModelsRef.current, companions, uri);
    }, [isEditorCreated, companions, uri]);

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

import { DefaultSuspense } from "../DefaultSuspense";
import "./Editor.css";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";
import type { ModelText } from "./createMonacoEditor";

export interface ReadOnlyEditorProps {
  darkMode: boolean;
  uri: string;
  language?: string;
  programText: string;
  companions?: ModelText[];
}

export function ReadOnlyEditor({
  darkMode,
  uri,
  language,
  programText,
  companions,
}: ReadOnlyEditorProps) {
  return (
    <DefaultSuspense>
      <LazyMonacoWrapper
        // The URI and language of an editor are fixed, so another file is another editor
        key={uri}
        darkMode={darkMode}
        uri={uri}
        language={language}
        programText={programText}
        companions={companions}
        additionalMonacoOptions={{
          readOnly: true,
          minimap: {
            enabled: false,
          },
        }}
      />
    </DefaultSuspense>
  );
}

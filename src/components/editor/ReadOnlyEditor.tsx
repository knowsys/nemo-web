import { DefaultSuspense } from "../DefaultSuspense";
import "./Editor.css";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";

export interface ReadOnlyEditorProps {
  darkMode: boolean;
  programText: string;
}

export function ReadOnlyEditor({ darkMode, programText }: ReadOnlyEditorProps) {
  return (
    <DefaultSuspense>
      <LazyMonacoWrapper
        darkMode={darkMode}
        programText={programText}
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

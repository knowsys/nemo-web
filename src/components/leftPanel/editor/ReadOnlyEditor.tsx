import { DefaultSuspense } from "../../DefaultSuspense";
import "./Editor.css";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";

export interface ReadOnlyEditorProps {
  programText: string;
}

export function ReadOnlyEditor({ programText }: ReadOnlyEditorProps) {
  return (
    <DefaultSuspense>
      <LazyMonacoWrapper
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

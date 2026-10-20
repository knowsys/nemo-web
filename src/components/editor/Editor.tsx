import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import "./Editor.css";
import { programInfoSlice } from "../../store/programInfo";
import { selectDarkMode } from "../../store/preferences/selectors/selectDarkMode";
import { selectProgramText } from "../../store/programInfo/selectors/selectProgramText";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";
import { DefaultSuspense } from "../DefaultSuspense";
import {
  NevBroadcastChannelHandler,
  useNevBroadcastChannelListener,
} from "../../NevBroadcastChannel";
import { useNemoWorkerRef } from "../../NemoWorkerContext/NemoWorkerContext";
import { MonacoWrapperImperativeHandle } from "./MonacoWrapper";
import type { ModelText } from "./createMonacoEditor";
import { useInputFiles } from "../../InputFilesContext/InputFilesContext";

/**
 * The directory of the program in the editor, in which its module input files lie
 */
const PROGRAM_DIRECTORY = "file:///";

export function Editor() {
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector(selectDarkMode);
  const programText = useAppSelector(selectProgramText);

  const workerRef = useNemoWorkerRef();

  // The modules among the input files, so that the language server resolves `@use` to them
  const { inputs } = useInputFiles();
  const modules: ModelText[] = useMemo(
    () =>
      inputs
        .filter((input) => input.moduleText !== undefined)
        .map((input) => ({
          uri: PROGRAM_DIRECTORY + input.resource,
          text: input.moduleText!,
          language: "nemo",
        })),
    [inputs],
  );

  const editorRef = useRef<MonacoWrapperImperativeHandle>(null);

  // request notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Jump to line in editor when Nev requests it
  const jumpToRuleHandler: NevBroadcastChannelHandler<{ id: number }, string> =
    useCallback(
      async ({ id: ruleId }) => {
        if (!workerRef?.current) {
          throw "Cannot process message. Reasoning was not performed.";
        }

        // get line number from rule id using the Nemo backend
        const lineToJumpTo =
          await workerRef.current.getLineNumberFromRuleId(ruleId);

        if (lineToJumpTo === undefined) {
          throw "The target Rule Id was not found in the program.";
        }

        // briefly change window title
        const originalTitle = document.title;
        document.title = `[!] ${originalTitle}`;
        setTimeout(() => {
          document.title = originalTitle;
        }, 2000);

        // send notification if allowed
        if (Notification.permission === "granted") {
          const notification = new Notification("Rule Highlighted", {
            body: "The rule has been highlighted in the editor.",
          });
          notification.addEventListener("click", () => window.focus());
        }

        editorRef.current?.jumpToLine(lineToJumpTo);

        // Nev expects some kind of response...
        return "Successfully jumped to line";
      },
      [workerRef],
    );
  useNevBroadcastChannelListener<{ id: number }, string>(
    "jumpToRule",
    jumpToRuleHandler,
  );

  return (
    <DefaultSuspense>
      <LazyMonacoWrapper
        ref={editorRef}
        darkMode={darkMode}
        uri={PROGRAM_DIRECTORY + "program.rls"}
        programText={programText}
        companions={modules}
        onProgramTextChange={(programText: string) => {
          dispatch(programInfoSlice.actions.setProgramText(programText));
        }}
      />
    </DefaultSuspense>
  );
}

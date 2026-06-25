import { useCallback, useEffect, useRef } from "react";
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

export function Editor() {
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector(selectDarkMode);
  const programText = useAppSelector(selectProgramText);

  const workerRef = useNemoWorkerRef();

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
        programText={programText}
        onProgramTextChange={(programText: string) => {
          dispatch(programInfoSlice.actions.setProgramText(programText));
        }}
      />
    </DefaultSuspense>
  );
}

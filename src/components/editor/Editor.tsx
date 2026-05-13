import { useAppDispatch, useAppSelector } from "../../store";
import "./Editor.css";
import { programInfoSlice } from "../../store/programInfo";
import { selectDarkMode } from "../../store/preferences/selectors/selectDarkMode";
import { selectProgramText } from "../../store/programInfo/selectors/selectProgramText";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";
import { DefaultSuspense } from "../DefaultSuspense";

export function Editor() {
  const dispatch = useAppDispatch();

  const darkMode = useAppSelector(selectDarkMode);
  const programText = useAppSelector(selectProgramText);

  return (
    <DefaultSuspense>
      <LazyMonacoWrapper
        darkMode={darkMode}
        programText={programText}
        onProgramTextChange={(programText: string) => {
          dispatch(programInfoSlice.actions.setProgramText(programText));
        }}
      />
    </DefaultSuspense>
  );
}

import { useAppDispatch, useAppSelector } from "../../store";
import "./Editor.css";
import { programInfoSlice } from "../../store/programInfo";
import { selectProgramText } from "../../store/programInfo/selectors/selectProgramText";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";
import { DefaultSuspense } from "../DefaultSuspense";

export function Editor() {
  const dispatch = useAppDispatch();

  const programText = useAppSelector(selectProgramText);

  return (
    <DefaultSuspense>
      <LazyMonacoWrapper
        programText={programText}
        onProgramTextChange={(programText: string) => {
          dispatch(programInfoSlice.actions.setProgramText(programText));
        }}
      />
    </DefaultSuspense>
  );
}

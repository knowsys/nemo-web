import { RootState } from "../..";

export const selectProgramText = (state: RootState) =>
  state.programInfo.programText;

import { PayloadAction } from "@reduxjs/toolkit";
import { ProgramInfo } from "../ProgramInfo";

export function setProgramText(
  state: ProgramInfo,
  action: PayloadAction<string>,
): ProgramInfo {
  return {
    ...state,
    programText: action.payload,
  };
}

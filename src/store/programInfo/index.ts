import { createSlice } from "@reduxjs/toolkit";
import { initialProgramInfo } from "./initialProgramInfo";
import { setProgramText } from "./reducers/setProgramText";

export const programInfoSlice = createSlice({
  name: "programInfoSlice",
  initialState: initialProgramInfo,
  reducers: {
    setProgramText,
  },
});

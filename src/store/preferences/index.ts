import { createSlice } from "@reduxjs/toolkit";
import { initialPreferences } from "./initialPreferences";
import { setDarkMode } from "./reducers/setDarkMode";

export const preferencesSlice = createSlice({
  name: "preferencesSlice",
  initialState: initialPreferences,
  reducers: {
    setDarkMode,
  },
});

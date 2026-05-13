import { RootState } from "../..";

export const selectDarkMode = (state: RootState) => state.preferences.darkMode;

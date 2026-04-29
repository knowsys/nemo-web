import { PayloadAction } from "@reduxjs/toolkit";
import { Preferences } from "../Preferences";

export function setDarkMode(
  state: Preferences,
  action: PayloadAction<boolean>,
): Preferences {
  return {
    ...state,
    darkMode: action.payload,
  };
}

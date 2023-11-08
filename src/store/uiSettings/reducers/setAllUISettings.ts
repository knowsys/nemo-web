import { PayloadAction } from "@reduxjs/toolkit";
import { UISettings } from "../UISettings";

export function setAllUISettings(
  state: UISettings,
  action: PayloadAction<UISettings>,
): UISettings {
  return {
    ...state,
    ...action.payload,
  };
}

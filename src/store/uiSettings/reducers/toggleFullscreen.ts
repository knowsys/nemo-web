import { PayloadAction } from "@reduxjs/toolkit";
import { UISettings } from "../UISettings";

export function toggleFullscreen(
  state: UISettings,
  _action: PayloadAction<void>,
): UISettings {
  return {
    ...state,
    enableFullscreen: !state.enableFullscreen,
  };
}

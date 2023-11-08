import { PayloadAction } from "@reduxjs/toolkit";
import { UISettings } from "../UISettings";

export function toggleRightPanel(
  state: UISettings,
  _action: PayloadAction<void>,
): UISettings {
  return {
    ...state,
    showRightPanel: !state.showRightPanel,
    showLeftPanel: state.showLeftPanel || state.showRightPanel,
  };
}

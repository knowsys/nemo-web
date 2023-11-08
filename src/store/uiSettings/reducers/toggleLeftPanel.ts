import { PayloadAction } from "@reduxjs/toolkit";
import { UISettings } from "../UISettings";

export function toggleLeftPanel(
  state: UISettings,
  _action: PayloadAction<void>,
): UISettings {
  return {
    ...state,
    showLeftPanel: !state.showLeftPanel,
    showRightPanel: state.showRightPanel || state.showLeftPanel,
  };
}

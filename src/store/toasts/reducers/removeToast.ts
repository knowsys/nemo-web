import { PayloadAction } from "@reduxjs/toolkit";
import { Toasts } from "../Toasts";

export function removeToast(
  state: Toasts,
  action: PayloadAction<number>,
): Toasts {
  const newActiveToasts = state.activeToasts.slice();
  newActiveToasts.splice(action.payload, 1);
  return {
    ...state,
    activeToasts: newActiveToasts,
  };
}

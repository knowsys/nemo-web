import { PayloadAction } from "@reduxjs/toolkit";
import { ToastInfo, Toasts } from "../Toasts";

export function addToast(
  state: Toasts,
  action: PayloadAction<ToastInfo>,
): Toasts {
  return {
    ...state,
    activeToasts: [action.payload, ...state.activeToasts],
  };
}

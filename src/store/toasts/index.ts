import { createSlice } from "@reduxjs/toolkit";
import { initialToasts } from "./initialToasts";
import { addToast } from "./reducers/addToast";
import { removeToast } from "./reducers/removeToast";

export const toastsSlice = createSlice({
  name: "toasts",
  initialState: initialToasts,
  reducers: {
    addToast,
    removeToast,
  },
});

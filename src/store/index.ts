import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { programInfoSlice } from "./programInfo";
import { toastsSlice } from "./toasts";

export function createStore() {
  return configureStore({
    reducer: {
      programInfo: programInfoSlice.reducer,
      toasts: toastsSlice.reducer,
    },
    middleware: (m) => {
      return m({
        serializableCheck: true,
      });
    },
  });
}

export type RootStore = ReturnType<typeof createStore>;
export type RootState = ReturnType<RootStore["getState"]>;
export type AppDispatch = RootStore["dispatch"];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

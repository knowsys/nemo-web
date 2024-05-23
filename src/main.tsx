import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { App } from "./components/App";
import { Provider } from "react-redux";
import { createStore } from "./store";
import { programInfoSlice } from "./store/programInfo";
import "./i18n/i18n";
import {
  programTextLocalStorageKey,
  uiSettingLocalStorageKey,
} from "./localStorageKeys";
import { uiSettingsSlice } from "./store/uiSettings";
import { LocalStorageAutoSaver } from "./components/LocalStorageAutoSaver";

const store = createStore();
console.info("[Redux] Created store: ", store);

store.subscribe(() => console.info("[Redux] Store action dispatched"));

const savedProgramText = window.localStorage.getItem(
  programTextLocalStorageKey,
);
if (savedProgramText !== null && savedProgramText !== "") {
  store.dispatch(programInfoSlice.actions.setProgramText(savedProgramText));
}
const savedUISettings =
  window.localStorage.getItem(uiSettingLocalStorageKey) || undefined;
if (savedUISettings !== undefined) {
  try {
    store.dispatch(
      uiSettingsSlice.actions.setAllUISettings(JSON.parse(savedUISettings)),
    );
  } catch (error) {
    console.error("[App] Error while loading UI setting from local storage", {
      savedUISettings,
      error,
    });
  }
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <LocalStorageAutoSaver />
    </Provider>
  </React.StrictMode>,
);

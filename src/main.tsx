import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { App } from "./components/App";
import { Provider } from "react-redux";
import { createStore } from "./store";
import { programInfoSlice } from "./store/programInfo";
import { selectProgramText } from "./store/programInfo/selectors/selectProgramText";
import "./i18n/i18n";
import { programTextLocalStorageKey } from "./localStorageKeys";
import { LocalStorageAutoSaver } from "./components/LocalStorageAutoSaver";

const store = createStore();
console.info("[Redux] Created store: ", store);

store.subscribe(() => console.info("[Redux] Store action dispatched"));

let code = null;
if (window.location.hash !== "") {
  try {
    code = atob(window.location.hash.substring(1)); // first symbol is always # so we skip that
  } catch (e) {
    console.error(e);
  }
}

if (!code) {
  code = window.localStorage.getItem(programTextLocalStorageKey);
}

if (code !== null && code !== "") {
  store.dispatch(programInfoSlice.actions.setProgramText(code));
}

store.subscribe(() => {
  const state = store.getState();
  const code = selectProgramText(state);

  window.location.hash = btoa(code);
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <LocalStorageAutoSaver />
    </Provider>
  </React.StrictMode>,
);

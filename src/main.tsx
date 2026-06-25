import React from "react";
import { createRoot } from "react-dom/client";
import { nanoid } from "nanoid";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { App } from "./components/App";
import { Provider } from "react-redux";
import { createStore } from "./store";
import { programInfoSlice } from "./store/programInfo";
import { selectProgramText } from "./store/programInfo/selectors/selectProgramText";
import { NemoSessionIdContext } from "./nemoSessionIdContext";
import { NemoWorkerProvider } from "./NemoWorkerContext/NemoWorkerContextProvider";
import "./i18n/i18n";

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

if (code !== null && code !== "") {
  store.dispatch(programInfoSlice.actions.setProgramText(code));
}

store.subscribe(() => {
  const state = store.getState();
  const code = selectProgramText(state);

  window.location.hash = btoa(code);
});

// Create a unique id for this Nemo tab for interaction with Nev.
const nemoSessionId = nanoid();

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NemoSessionIdContext.Provider value={nemoSessionId}>
      <NemoWorkerProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </NemoWorkerProvider>
    </NemoSessionIdContext.Provider>
  </React.StrictMode>,
);

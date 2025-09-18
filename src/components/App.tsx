import { Spinner } from "react-bootstrap";
import { NavigationBar } from "./navigationBar/NavigationBar";
import { Footer } from "./footer/Footer";
import { Suspense } from "react";
import { Toasts } from "./toasts/Toasts";
import { Editor } from "./editor/Editor";
import { ExecutionPanel } from "./executionPanel/ExecutionPanel";

export function DefaultSpinner() {
  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            <Spinner />
          </span>
        </div>
      </div>
    </>
  );
}

export function App() {
  return (
    <>
      <Suspense fallback={<DefaultSpinner />}>
        <NavigationBar />
        <div aria-live="polite" aria-atomic="true" className="position-static">
          <Toasts />
        </div>
        <main>
          <Editor />
          <ExecutionPanel />
        </main>
        <Footer />
      </Suspense>
    </>
  );
}

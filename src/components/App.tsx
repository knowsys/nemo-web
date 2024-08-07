import { Container, Row, Col, Spinner } from "react-bootstrap";
import { NavigationBar } from "./navigationBar/NavigationBar";
import { useAppSelector } from "../store";
import { RightPanel } from "./rightPanel/RightPanel";
import { LeftPanel } from "./leftPanel/LeftPanel";
import { Footer } from "./footer/Footer";
import { Suspense } from "react";
import { Toasts } from "./toasts/Toasts";
import { MainArticle } from "./MainArticle";

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
  const uiSettings = useAppSelector((state) => state.uiSettings);

  const panelWidth =
    uiSettings.showLeftPanel && uiSettings.showRightPanel ? 6 : 12;

  return (
    <>
      <Suspense fallback={<DefaultSpinner />}>
        <NavigationBar />
        <div aria-live="polite" aria-atomic="true" className="position-static">
          <Toasts />
        </div>
        <Container fluid={uiSettings.enableFullscreen}>
          <br />
          <main>
            <Row>
              {uiSettings.showLeftPanel ? (
                <Col sm={panelWidth}>
                  <LeftPanel />
                </Col>
              ) : (
                <></>
              )}
              <Col
                sm={panelWidth}
                className={uiSettings.showRightPanel ? "" : "d-none"}
              >
                <RightPanel />
              </Col>
            </Row>
            <hr />
            <MainArticle />
          </main>
        </Container>
        <br />
        <Footer></Footer>
      </Suspense>
    </>
  );
}

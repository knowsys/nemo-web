import { Navbar, Container, Nav, Button } from "react-bootstrap";
import "./NavigationBar.css";
import { UISettings } from "./UISettings";
import { useTranslation } from "react-i18next";
import { links } from "../links";
import { useEffect, useState } from "react";
import { createNemoWorker } from "../../nemoWorker/NemoWorker";
import { TextTooltip } from "../TextTooltip";

export function NavigationBar() {
  const { t } = useTranslation("navigationBar");

  const [nemoVersion, setNemoVersion] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const worker = await createNemoWorker(() => {});
      const version = await worker.getNemoVersion();
      if (version !== undefined) {
        setNemoVersion("v" + version);
      }
    })();
  });

  return (
    <Navbar variant="light" expand="lg" style={{ backgroundColor: "#e3f2fd" }}>
      <Container>
        <Navbar.Brand className="me-0">Nemo Rule Engine</Navbar.Brand>
        <Navbar.Toggle aria-controls="navigation-bar-nav" />
        <Navbar.Collapse id="navigation-bar-nav">
          <Nav className="me-auto">
            <TextTooltip
              text="Version of Nemo Rule Engine (nemo-wasm)"
              tooltipID="navigation-bar-version-tooltip"
            >
              <Nav.Link className="me-2">{nemoVersion}</Nav.Link>
            </TextTooltip>
            <Nav.Link href={links.sourceCode} target="_blank">
              {t("sourceCode")}
            </Nav.Link>
            <Nav.Link href={links.documentation} target="_blank">
              {t("documentation")}
            </Nav.Link>
          </Nav>
          <a href={links.feedback} target="_blank">
            <Button className="me-4" variant="primary">
              {t("common:giveFeedback")}
            </Button>
          </a>
          <UISettings />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

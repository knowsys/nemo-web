import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import "./NavigationBar.css";
import { useTranslation } from "react-i18next";
import { links } from "../links";
import { useEffect, useState } from "react";
import { createNemoWorker } from "../../nemoWorker/NemoWorker";
import logoNemo from "./nemo-logo-rusty.svg";
import { Icon } from "../Icon";
import { ShowExamplesButton } from "./ShowExamplesButton";

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
    <Navbar
      variant="light"
      expand="md"
      style={{ borderBottom: "1px solid #dddddd" }}
    >
      <Container fluid>
        <Navbar.Brand>
          <img
            src={logoNemo}
            alt="Nemo - Graph Rule Engine"
            className="logo-nemo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navigation-bar-nav" />
        <Navbar.Collapse id="navigation-bar-nav">
          <Nav className="me-auto">
            <ShowExamplesButton />
            <NavDropdown title={<><Icon name="question-circle"/> Help</>} id="nav-dropdown">
              <NavDropdown.Item href={links.documentation} target="_blank">{t("documentation")}</NavDropdown.Item>
              <NavDropdown.Item href={links.sourceCodeNemo} target="_blank">{t("sourceCodeNemo")}</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href={links.feedback} target="_blank">{t("common:giveFeedback")}</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Navbar.Text>
            <span style={{ fontSize: ".8em" }}>Version: {nemoVersion}</span>{" "}
            <a
              href={links.sourceCodeNemo}
              target="_blank"
              style={{ color: "inherit" }}
            >
              <Icon name="github" />
            </a>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

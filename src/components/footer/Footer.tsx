import { Container, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { links } from "../links";
import logoICCL from "./logoICCL.svg";
import logoTUDresden from "./logoTUDresden.svg";
import "./Footer.css";
import { Link } from "../link/Link";

/**
 * Application footer containing additional links and attribution.
 */
export function Footer() {
  const { t } = useTranslation("footer");

  return (
    <footer className="footer">
      <Container>
        <Row className="justify-content-center">
          <Col md={3}>
            <Link href={links.homepageTUDresden}>
              <img
                src={logoTUDresden}
                alt="TU Dresden"
                className="footer-logo-tu-dresden"
              />
            </Link>
          </Col>
          <Col md={4}>
            <Link href={links.homepageICCL}>
              <img
                src={logoICCL}
                alt="International Center For Computational Logic"
                className="footer-logo-iccl"
              />
            </Link>
          </Col>
          <Col md={5}>
            Made with ❤️ in Dresden.
            <br />
            <a href={links.legalNoticeICCL}>Legal notice (Impressum)</a>
            <br />
            <a href="3rd-party-licenses.txt">{t("thirdPartyLicenses")}</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

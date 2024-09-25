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
    <footer>
      <div className="mt-auto py-3" style={{ borderTop: "1px solid #eeeeee" }}>
        <Container>
          <Row>
            <Col md={2}>
              <Link href={links.homepageTUDresden}>
                <img
                  src={logoTUDresden}
                  alt="TU Dresden"
                  className="footer-logo-tu-dresden"
                />
              </Link>
            </Col>
            <Col md={3}>
              <Link href={links.homepageICCL}>
                <img
                  src={logoICCL}
                  alt="International Center For Computational Logic"
                  className="footer-logo-iccl"
                />
              </Link>
            </Col>
            <Col md={3}>
              <p>Made with ❤️ in Dresden.</p>
              <p>
                <a href={links.homepageTUDresden}>TU Dresden</a>{" "}
                <a href={links.legalNoticeTUDresden}>(Legal notice)</a>
              </p>
            </Col>
            <Col md={3}>
              <p>
                <Link href={links.feedback}>
                  <>{t("common:giveFeedback")}</>
                </Link>
              </p>
              <p>
                <Link href={links.sourceCodeNemo}>
                  <>{t("sourceCodeNemo")}</>
                </Link>
              </p>
              <p>
                <Link href={links.sourceCodeNemoWeb}>
                  <>{t("sourceCodeNemoWeb")}</>
                </Link>
              </p>
              <p>
                <Link href={links.documentation}>
                  <>{t("navigationBar:documentation")}</>
                </Link>
              </p>
              <p>
                <a href="3rd-party-licenses.txt">{t("thirdPartyLicenses")}</a>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}

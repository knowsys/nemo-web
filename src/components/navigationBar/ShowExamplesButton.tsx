import { useState } from "react";
import { Button, Modal, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../store";
import { programInfoSlice } from "../../store/programInfo";
import { Examples } from "../examples/Examples";
import { Icon } from "../Icon";

export function ShowExamplesButton() {
  const { t } = useTranslation("editor");

  const dispatch = useAppDispatch();

  const [isModalShown, setIsModalShown] = useState(false);
  const [currentExampleProgramText, setCurrentExampleProgramText] =
    useState("");

  const hideModal = () => setIsModalShown(false);

  return (
    <>
      <Nav.Link onClick={() => setIsModalShown(true)}>
        {t("examples")} <Icon name="file-earmark-image" />
      </Nav.Link>

      <Modal show={isModalShown} onHide={hideModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{t("examples:title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Examples onProgramTextChange={setCurrentExampleProgramText} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              dispatch(
                programInfoSlice.actions.setProgramText(
                  currentExampleProgramText,
                ),
              );
              hideModal();
            }}
          >
            Copy example to editor
          </Button>
          <Button variant="secondary" onClick={hideModal}>
            {t("common:closeModal")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

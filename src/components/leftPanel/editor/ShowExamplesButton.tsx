import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../store";
import { programInfoSlice } from "../../../store/programInfo";
import { Examples } from "../../examples/Examples";
import { Icon } from "../../Icon";

export function ShowExamplesButton() {
  const { t } = useTranslation("editor");

  const dispatch = useAppDispatch();

  const [isModalShown, setIsModalShown] = useState(false);
  const [currentExampleProgramText, setCurrentExampleProgramText] =
    useState("");

  const hideModal = () => setIsModalShown(false);

  return (
    <>
      <Button
        variant="outline-dark"
        size="sm"
        className="me-1"
        onClick={() => setIsModalShown(true)}
      >
        <Icon name="file-earmark-image" /> {t("examples")}
      </Button>

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

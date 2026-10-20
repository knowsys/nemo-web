import { useState } from "react";
import { Button, Modal, Nav } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../store";
import { programInfoSlice } from "../../store/programInfo";
import { Examples, LoadedExample } from "../examples/Examples";
import { Icon } from "../Icon";
import { useInputFiles } from "../../InputFilesContext/InputFilesContext";

export function ShowExamplesButton() {
  const { t } = useTranslation("editor");

  const dispatch = useAppDispatch();
  const { setInputs } = useInputFiles();

  const [isModalShown, setIsModalShown] = useState(false);
  const [currentExample, setCurrentExample] = useState<
    LoadedExample | undefined
  >(undefined);

  const hideModal = () => setIsModalShown(false);

  return (
    <>
      <Nav.Link onClick={() => setIsModalShown(true)}>
        <Icon name="file-earmark-code" /> {t("examples")}
      </Nav.Link>

      <Modal show={isModalShown} onHide={hideModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>{t("examples:title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Examples onExampleChange={setCurrentExample} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            disabled={currentExample === undefined}
            onClick={() => {
              if (currentExample === undefined) {
                return;
              }
              // An example replaces the input files, too. They are set first, so that the
              // editor knows the modules among them when the program arrives.
              setInputs(currentExample.inputs);
              dispatch(
                programInfoSlice.actions.setProgramText(
                  currentExample.programText,
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

import { useAppDispatch, useAppSelector } from "../../../store";
import "./Editor.css";
import { Button, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icon } from "../../Icon";
import { uiSettingsSlice } from "../../../store/uiSettings";
import { OpenFileButton } from "./OpenFileButton";
import { DownloadFileButton } from "./DownloadFileButton";
import { programInfoSlice } from "../../../store/programInfo";
import { selectProgramText } from "../../../store/programInfo/selectors/selectProgramText";
import { ShowExamplesButton } from "./ShowExamplesButton";
import { LazyMonacoWrapper } from "./LazyMonacoWrapper";
import { DefaultSuspense } from "../../DefaultSuspense";

export function Editor() {
  const { t } = useTranslation("editor");

  const dispatch = useAppDispatch();
  const isRightPanelShown = useAppSelector(
    (state) => state.uiSettings.showRightPanel,
  );

  const programText = useAppSelector(selectProgramText);

  return (
    <Card>
      <Card.Header>
        <span className="align-middle me-2">{t("codeEditor")}</span>{" "}
        <ShowExamplesButton />
        <OpenFileButton /> <DownloadFileButton />
        {!isRightPanelShown ? (
          <Button
            className="float-end"
            size="sm"
            variant="outline-primary"
            onClick={() => {
              dispatch(uiSettingsSlice.actions.toggleRightPanel());
            }}
          >
            <Icon name="caret-right-fill"></Icon>
            {t("runProgram")}
          </Button>
        ) : undefined}
      </Card.Header>
      <Card.Body className="editor-card-body">
        <DefaultSuspense>
          <LazyMonacoWrapper
            programText={programText}
            onProgramTextChange={(programText: string) => {
              dispatch(programInfoSlice.actions.setProgramText(programText));
            }}
          />
        </DefaultSuspense>
      </Card.Body>
    </Card>
  );
}

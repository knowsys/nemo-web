import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { chooseFile } from "../../../chooseFile";
import { useAppDispatch } from "../../../store";
import { programInfoSlice } from "../../../store/programInfo";
import { Icon } from "../../Icon";

export function OpenFileButton() {
  const { t } = useTranslation("navigationBar");
  const dispatch = useAppDispatch();

  const openFile = (file: File) => {
    const reader = new window.FileReader();

    reader.onload = () => {
      if (!reader.result) {
        return;
      }
      dispatch(
        programInfoSlice.actions.setProgramText(reader.result.toString()),
      );
    };

    reader.readAsText(file);
  };

  return (
    <Button
      variant="outline-dark"
      size="sm"
      onClick={() => {
        chooseFile((fileList) => {
          if (fileList.length === 0) {
            return;
          }
          openFile(fileList[0]);
        });
      }}
    >
      <Icon name="file-earmark-text" /> {t("openFile")}
    </Button>
  );
}

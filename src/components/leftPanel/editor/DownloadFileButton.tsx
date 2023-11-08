import { useRef } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../store";
import { Icon } from "../../Icon";
import { selectProgramText } from "../../../store/programInfo/selectors/selectProgramText";

export function DownloadFileButton() {
  const { t } = useTranslation("navigationBar");
  const programText = useAppSelector(selectProgramText);

  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  return (
    <Button
      variant="outline-dark"
      size="sm"
      onClick={() => {
        if (anchorRef.current === null) {
          return;
        }

        anchorRef.current.href = window.URL.createObjectURL(
          new Blob([programText], { type: "text/plain" }),
        );
        anchorRef.current.download = "program.txt";
        anchorRef.current.click();
      }}
    >
      <a ref={anchorRef} className="d-none" />
      <Icon name="file-earmark-arrow-down" /> {t("downloadFile")}
    </Button>
  );
}

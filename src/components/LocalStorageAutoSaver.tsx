import { useEffect } from "react";
import { createTimeoutEffect } from "../createTimeoutEffect";
import { programTextLocalStorageKey } from "../localStorageKeys";
import { useAppSelector } from "../store";
import { selectProgramText } from "../store/programInfo/selectors/selectProgramText";

/**
 * Saves the UI setting and editor state to the local storage.
 */
export function LocalStorageAutoSaver() {
  const programText = useAppSelector(selectProgramText);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    createTimeoutEffect(() => {
      window.localStorage.setItem(programTextLocalStorageKey, programText);
    }, 500),
    [programText],
  );

  return <></>;
}

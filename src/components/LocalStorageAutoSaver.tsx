import { useEffect } from "react";
import { createTimeoutEffect } from "../createTimeoutEffect";
import {
  programTextLocalStorageKey,
  uiSettingLocalStorageKey,
} from "../localStorageKeys";
import { useAppSelector } from "../store";
import { selectProgramText } from "../store/programInfo/selectors/selectProgramText";

/**
 * Saves the UI setting and editor state to the local storage.
 */
export function LocalStorageAutoSaver() {
  const uiSettings = useAppSelector((store) => store.uiSettings);
  const programText = useAppSelector(selectProgramText);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(
    createTimeoutEffect(() => {
      window.localStorage.setItem(programTextLocalStorageKey, programText);
      window.localStorage.setItem(
        uiSettingLocalStorageKey,
        JSON.stringify(uiSettings),
      );
    }, 500),
    [uiSettings, programText],
  );

  return <></>;
}

import { useEffect, useCallback } from "react";
import { Navbar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import { preferencesSlice } from "../../store/preferences";
import { selectDarkMode } from "../../store/preferences/selectors/selectDarkMode";
import { Icon } from "../Icon";

export function DarkModeSwitch() {
  const { t } = useTranslation("darkModeSwitch");

  const darkPreferred = useAppSelector(selectDarkMode);
  const dispatch = useAppDispatch();
  const setDarkPreferred = useCallback(
    (v: boolean) => dispatch(preferencesSlice.actions.setDarkMode(v)),
    [dispatch],
  );

  // initially, set preference according to browser settings
  useEffect(() => {
    setDarkPreferred(window.matchMedia("(prefers-color-scheme: dark)").matches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      darkPreferred ? "dark" : "light",
    );
  }, [darkPreferred]);

  return (
    <Navbar.Text
      onClick={() => setDarkPreferred(!darkPreferred)}
      title={darkPreferred ? t("switchToLight") : t("switchToDark")}
      style={{ marginLeft: "1em" }}
    >
      <Icon name={darkPreferred ? "moon-stars-fill" : "sun-fill"} />
    </Navbar.Text>
  );
}

import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { Icon } from "../Icon";

export function LanguageChooser() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language.substring(0, 2);

  return (
    <Button
      variant="outline-secondary"
      onClick={() => {
        // Toggle language
        const newLanguage = currentLanguage.startsWith("en") ? "de" : "en";

        const url = new URL(window.location.href);
        url.searchParams.set("language", newLanguage);
        window.history.pushState({}, "", url.toString());

        i18n.changeLanguage(newLanguage);
      }}
    >
      <Icon name="translate" /> {currentLanguage.toUpperCase()}
    </Button>
  );
}

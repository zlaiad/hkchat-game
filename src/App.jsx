import "./App.css";
import { useTranslation } from "react-i18next";
import { setLanguage, SUPPORTED } from "./i18n";
import LegacyGame from "./LegacyGame";

function App() {
  const { t, i18n } = useTranslation();

  return (
    <div className="react-shell">
      <div className="lang-switcher" data-no-i18n>
        <label htmlFor="lang-select">{t("ui.language")}</label>
        <select
          id="lang-select"
          value={i18n.language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {SUPPORTED.map((lng) => (
            <option key={lng} value={lng}>
              {t(`ui.lang.${lng}`)}
            </option>
          ))}
        </select>
      </div>
      <LegacyGame language={i18n.language} />
    </div>
  );
}

export default App;

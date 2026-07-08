import { useEffect, useRef } from "react";
import markup from "./legacy/markup.html?raw";
import "./legacy/styles.css";
import { initLegacyGame } from "./legacy/game";
import { applyDomTranslation } from "./i18n/translateDom";

export default function LegacyGame({ language }) {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = markup;
    initLegacyGame();
    applyDomTranslation(hostRef.current, language);
  }, []);

  useEffect(() => {
    if (!hostRef.current) return;
    applyDomTranslation(hostRef.current, language);
  }, [language]);

  return <div ref={hostRef} />;
}


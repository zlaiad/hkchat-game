import { useEffect, useRef } from "react";
import markup from "./legacy/markup.html?raw";
import "./legacy/styles.css";
import { initLegacyGame } from "./legacy/game";
import { applyDomTranslation } from "./i18n/translateDom";

export default function LegacyGame({ language }) {
  const hostRef = useRef(null);
  const languageRef = useRef(language);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (!hostRef.current) return;
    hostRef.current.innerHTML = markup;
    initLegacyGame();
    applyDomTranslation(hostRef.current, languageRef.current);

    const translateChangedNode = (node, seen) => {
      if (!node || !hostRef.current) return;
      const target = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      if (!target || !hostRef.current.contains(target) || seen.has(target)) return;
      seen.add(target);
      applyDomTranslation(target, languageRef.current);
    };

    const observer = new MutationObserver((records) => {
      const seen = new Set();
      records.forEach((record) => {
        if (record.type === "characterData") {
          translateChangedNode(record.target, seen);
          return;
        }
        translateChangedNode(record.target, seen);
        record.addedNodes.forEach((node) => translateChangedNode(node, seen));
      });
    });
    observer.observe(hostRef.current, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hostRef.current) return;
    applyDomTranslation(hostRef.current, language);
  }, [language]);

  return <div ref={hostRef} />;
}

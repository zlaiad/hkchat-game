import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

const SUPPORTED = ["zh-Hans", "zh-Hant", "en"];
const STORAGE_KEY = "mirror_lang";

export function detectLanguage() {
  const url = new URLSearchParams(window.location.search).get("lang");
  if (SUPPORTED.includes(url)) return url;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED.includes(stored)) return stored;
  const nav = (navigator.language || "").toLowerCase();
  if (nav.startsWith("zh-tw") || nav.startsWith("zh-hk") || nav.startsWith("zh-mo")) return "zh-Hant";
  if (nav.startsWith("en")) return "en";
  return "zh-Hans";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: "zh-Hans",
  interpolation: { escapeValue: false },
  returnNull: false,
  keySeparator: false,
  nsSeparator: false
});

export function setLanguage(lng) {
  if (!SUPPORTED.includes(lng)) return;
  i18n.changeLanguage(lng);
  window.localStorage.setItem(STORAGE_KEY, lng);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lng);
  window.history.replaceState(null, "", url.toString());
}

export { i18n, SUPPORTED };


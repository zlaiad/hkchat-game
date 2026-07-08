import { i18n } from "./index";
import { convertToZhHant } from "./zhHantMap";

function translateText(value, lang) {
  if (!value || !value.trim()) return value;
  const fromConfig = i18n.t(value, { lng: lang, defaultValue: value });
  if (fromConfig !== value) return fromConfig;
  if (lang === "zh-Hant") return convertToZhHant(value);
  return value;
}

function shouldSkip(el) {
  if (!el) return true;
  if (el.closest("[data-no-i18n]")) return true;
  const tag = el.tagName;
  return tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "OPTION";
}

export function applyDomTranslation(root, lang) {
  const target = root || document.body;
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const parent = node.parentElement;
    if (parent && !shouldSkip(parent)) {
      if (node.__origText === undefined) node.__origText = node.nodeValue;
      node.nodeValue = translateText(node.__origText, lang);
    }
    node = walker.nextNode();
  }
  target.querySelectorAll("[placeholder],[title],[aria-label]").forEach((el) => {
    if (shouldSkip(el)) return;
    ["placeholder", "title", "aria-label"].forEach((attr) => {
      if (!el.hasAttribute(attr)) return;
      const key = `orig-${attr}`;
      const original = el.dataset[key] || el.getAttribute(attr) || "";
      if (!el.dataset[key]) el.dataset[key] = original;
      el.setAttribute(attr, translateText(original, lang));
    });
  });
}


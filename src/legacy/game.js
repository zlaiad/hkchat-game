import rawScript from "./game.raw.js?raw";

let initialized = false;

export function initLegacyGame() {
  if (initialized) return;
  initialized = true;

  const bootstrap = new Function(rawScript);

  bootstrap();
}

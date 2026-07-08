import rawScript from "./game.raw.js?raw";

let initialized = false;

export function initLegacyGame() {
  if (initialized) return;
  initialized = true;

  const bootstrap = new Function(
    `${rawScript}
window.show = show;
window.openGame = openGame;
window.goHome = goHome;
window.restartAll = restartAll;
`
  );

  bootstrap();
}


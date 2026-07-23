# hkchat-game

A Hong Kong-localized pixel minigame collection about everyday challenges
experienced by older adults. The current interface uses the retained light
purple pixel-transit theme.

## Start locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually
`http://localhost:5173`.

## Language switching

- Use the top-right language selector in the UI
- Or use URL query params:
  - `?lang=zh-Hans`
  - `?lang=zh-Hant`
  - `?lang=en`

Selected language is persisted in `localStorage` as `mirror_lang`.

## Build

```bash
npm run build
```

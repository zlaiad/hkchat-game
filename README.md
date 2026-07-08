# hkchat-game (React + i18next)

Mirror of the `岁月之镜` demo migrated into a React app with i18next-based language switching.

## Start locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in terminal (usually `http://localhost:5173`).

## Language switching

- Use the top-right language selector in the UI
- Or use URL query params:
  - `?lang=zh-Hans`
  - `?lang=zh-Hant`
  - `?lang=en`

Selected language is persisted in `localStorage` as `mirror_lang`.

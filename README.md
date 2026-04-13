# Mira desktop app

Electron shell with a **Vite + React** renderer and a TypeScript main process.

## Development

From this directory, with a `.env` at the project root (`desktop-app/.env`) defining at least `API_URL` (and optionally `BETA`):

```bash
npm run dev
```

This runs the Vite dev server on **http://localhost:5173**, recompiles the main process on change, and launches Electron against that URL.

To run Electron only (Vite already running):

```bash
npm run dev:app
```

## Production

```bash
npm run build
npm start
```

`npm run build` produces `renderer/dist/` (UI) and `dist/main/` (Electron main + preload).

## Environment

The same `.env` keys are used as before:

- `API_URL` — backend base URL (no `/api/v1` suffix; that is added in code).
- `BETA` — set to `true` to use `/api/v2` instead of `/api/v1`.

The main process loads `.env` via `main/env.ts`. The renderer gets `API_URL` and `BETA` inlined at build time via Vite `define` (and `loadEnv` in dev).

# Mira desktop app

Electron + Vite/React. Environment keys: **`MIRA_API_URL`**, **`BETA`** only (see [`.env.example`](./.env.example)).

## Development

Create `desktop-app/.env` from `.env.example`, then:

```bash
npm install
npm run dev
```

Set `MIRA_API_URL` to a **production** API to exercise Railway + local WebSocket (`wss://`) without any local webhook server.

## Packaging (`npm run package`)

CI writes `.env.production` during the release workflow (see [`.github/workflows/release-cd.yml`](./.github/workflows/release-cd.yml)) using the **organization secret** **`MIRA_API_URL`** and `BETA=false`.

If you ever package locally, create a gitignored **`.env.production`** in this directory with `MIRA_API_URL=…` and `BETA=false` before running `npm run package`.

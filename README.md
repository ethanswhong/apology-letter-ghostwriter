# Apology Letter Ghostwriter

Vite + React frontend with an Express API hosted as a Vercel Node.js function. The Gemini API key stays **server-side**.

## Deploy to Vercel

1. Push the contents of this project folder to your Git repository. Configure **Root Directory** as the folder containing `package.json` (normally `./`).
2. In Vercel's **Settings → Environment Variables**, add `GEMINI_API_KEY` (your real Google Gemini API key) for the environments you deploy to, including Production, and redeploy.
3. The repository's `vercel.json` explicitly uses the **Vite** framework, `npm install --include=dev`, `npm run build`, and `dist` output. Do not override these with an old Vercel build/install command.
4. Use Node.js 22 or newer. The project uses **TypeScript 5.8.3**, not TypeScript 7.
5. Visit `https://YOUR-DEPLOYMENT.vercel.app/api/health`. It should return JSON with `status: "ok"` and `hasGeminiKey: true`. If the key is missing, it returns `status: "missing-api-key"`; add the key and redeploy.
6. If generation still fails, check **Vercel → Logs → Functions**. The UI now surfaces useful API errors (e.g. missing key, quota exhausted) rather than failing silently.

## Run locally

```bash
npm install --include=dev
cp .env.example .env
# Replace MY_GEMINI_API_KEY in .env with your own key.
npm run check
npm run build
npm run dev
```

Development uses the Express + Vite server at `http://localhost:3000`. Vercel serves the Vite static assets and dispatches `/api/*` to `api/index.ts`.

## Notes

- The old `bun.lock` was removed because it pinned the previous TypeScript 7 dependency tree. npm is used consistently for Vercel and local installs.
- `GET /api/health` checks server-side key configuration without exposing the key. It does **not** call Gemini, so it cannot confirm quota or permission status.
- There is no live Gemini call in the build step. Do not put keys in frontend source or use `VITE_GEMINI_API_KEY`.

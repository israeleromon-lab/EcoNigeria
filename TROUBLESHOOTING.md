# Troubleshooting & Common Issues Guide

This document outlines potential issues you might encounter while developing, deploying, or maintaining the EconoNigeria platform, along with their solutions.

---

## 1. Frontend: React Peer Dependency Errors (`npm install` fails)

**Symptom:** When running `npm install` in the `frontend/` directory, you get an `ERESOLVE overriding peer dependency` or `Could not resolve dependency` error relating to `react@19` vs `react@18`.
**Cause:** Next.js 15 uses React 19 by default, but some third-party libraries (like Recharts or older Shadcn components) strictly require React 18 in their package manifests.
**Fix:** Always run npm installs with the legacy peer dependencies flag:
```bash
npm install --legacy-peer-deps
# Or if adding a new package:
npm install package-name --legacy-peer-deps
```

---

## 2. Frontend: Vercel Build Fails due to Type or ESLint Errors

**Symptom:** `npm run build` works locally (sometimes), but Vercel immediately crashes with a `Type error` or `ESLint: Cannot find module` error.
**Cause:** Vercel treats all TypeScript and ESLint warnings as fatal errors. Furthermore, Next.js 15 flat config (`eslint.config.mjs`) can have strict pathing issues.
**Fix:**
- **For ESLint imports:** Ensure imports in `eslint.config.mjs` end with `.js` (e.g., `import nextVitals from "eslint-config-next/core-web-vitals.js";`).
- **For quick deployment bypass:** If you need to force a deploy through minor type/lint warnings, edit `next.config.ts`:
  ```typescript
  const nextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
  };
  export default nextConfig;
  ```

---

## 3. Frontend: `shadcn` CLI Fails to Install Components

**Symptom:** Running `npx shadcn@latest add component-name` fails with a certificate error: `reason: unable to verify the first certificate`.
**Cause:** Corporate networks, strict firewalls, or Windows machine SSL configurations can block Shadcn from downloading component JSON files from `ui.shadcn.com`.
**Fix:** Bypass the Node TLS check for that specific command:
- **Windows (PowerShell):** `$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npx shadcn@latest add [component]`
- **Mac/Linux:** `NODE_TLS_REJECT_UNAUTHORIZED=0 npx shadcn@latest add [component]`

*(Note: Always run `npx shadcn init` first if `components.json` is missing!)*

---

## 4. Backend: Railway Ephemeral Storage (Database Resets)

**Symptom:** You deploy the FastAPI backend to Railway, it works perfectly, but after a few days or after pushing a new update, all your saved data (AI reports, etc.) vanishes.
**Cause:** By default, Railway uses Ephemeral Storage for standard deployments. Any local SQLite database (`econonigeria.db`) created during runtime will be wiped out when the container restarts.
**Fix:** 
- **Option A (Recommended):** Provision a proper PostgreSQL database via Railway or Supabase. Update your `DATABASE_URL` environment variable to point to the Postgres instance.
- **Option B (Railway Volume):** Attach a persistent Volume to your Railway FastAPI service and point your SQLite file path to that mounted volume.

---

## 5. Backend: Frontend API Calls Failing (CORS Errors)

**Symptom:** In the browser console, you see `Cross-Origin Request Blocked` when the frontend tries to fetch data from the backend.
**Cause:** The FastAPI backend is rejecting the request because the frontend's domain isn't whitelisted in the CORS middleware.
**Fix:** Open `backend/app/main.py` and ensure the live Vercel URL is added to the `origins` list in the `CORSMiddleware` setup:
```python
origins = [
    "http://localhost:3000",
    "https://eco-nigeria-gules.vercel.app",
    "https://your-custom-domain.com"
]
```

---

## 6. Layout / CSS: Z-Index and Stacking Context Bugs

**Symptom:** Dropdowns, popovers, or mobile navigation sidebars are getting cut off, hiding behind other elements, or not stretching the full height of the screen.
**Cause:** The use of `backdrop-blur` (glassmorphism) on elements like the `<Header>` creates a new CSS "stacking context". `fixed` elements rendered inside it will be constrained by the Header's dimensions.
**Fix:** Never render full-screen fixed overlays (like mobile sidebars or modals) inside a parent that has `backdrop-blur`, `transform`, or `opacity`. Always render them at the absolute root of the application (e.g., in `ClientLayout.tsx`) or use a React Portal to attach them directly to `document.body`.

---

## 7. Data: Empty Charts or "Failed to load data"

**Symptom:** The dashboard loads, but a specific chart is empty or shows an alert icon.
**Cause:** The backend either hasn't been seeded with the raw CSV data, or the ETL pipeline encountered an empty/NaN value in the dataset.
**Fix:**
1. Ensure the raw CSVs exist in `backend/datasets/raw/`.
2. Locally, run the database seed script: `cd backend && python -m app.services.seed`.
3. Check the backend logs for JSON serialization errors related to `NaN` or `Infinity` values (FastAPI's JSONResponse rejects `NaN` by default; ensure your data processing replaces Pandas `NaN` with `None`).

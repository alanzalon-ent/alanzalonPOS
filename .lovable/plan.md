# Portability Phase 2 — Audit: running outside Lovable (no code changed)

## 1. Lovable-specific pieces (verified in repo at 080f560)
| Item | Where | Needed outside Lovable? |
| --- | --- | --- |
| `@lovable.dev/vite-tanstack-config` 2.27.2 (devDependency, public npm, MIT) | `vite.config.ts`, `package.json` | No. It wraps the build: adds TanStack Start, React, Tailwind, tsconfig paths, Nitro (default `cloudflare-module` preset), devtools, plus Lovable preview/sandbox hooks. Reads `LOVABLE_*` env vars only; all are no-ops when unset. |
| Error reporting to the Lovable editor | `src/lib/lovable-error-reporting.ts`, imported in `src/routes/__root.tsx` | No. Only calls `window.__lovableEvents` / `__lovableReportRuntimeError` if present; harmless elsewhere. |
| SSR error wrapper | `src/server.ts`, `src/lib/error-capture.ts`, `src/lib/error-page.ts`, `src/start.ts` | Standard TanStack code, not Lovable-only. `vite.config.ts` points the server entry at it. Keep. |
| `bunfig.toml` exclusions for `@lovable.dev/*` | `bunfig.toml` | Harmless. |
| `LOVABLE:BEGIN` block | `AGENTS.md` | Documentation only. |
- Not used: Lovable Cloud, AI gateway, connectors, `LOVABLE_API_KEY`, Supabase. App env var: only optional `VITE_POS_API_URL`.
- `vitest.config.ts` is already standalone (no Lovable package).
- The app has **no server functions or API routes**; all logic runs in the browser.

## 2. Standalone replacement config
Every package already installed directly: `@tanstack/react-start`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, `nitro`, `vite`. **No new packages needed.** (`@tanstack/devtools-vite` only dev-time, optional — skip.)

Proposed `vite.config.ts`:
```ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { port: 8080 },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({ server: { entry: "server" } }),
    nitro({ preset: process.env.NITRO_PRESET ?? "node-server" }),
    viteReact(),
    tailwindcss(),
  ],
});
```
Exact import paths/plugin order must be confirmed by running the build (unverified now; Nitro is a beta version).

## 3. Cloudflare vs Node
- Cloudflare Workers is **not required**: no Worker APIs, bindings, or server code are used. It is only the wrapper's default.
- Node (`node-server` preset → `node .output/server/index.mjs`) is the safer default for VS Code: easy to run locally, any VPS/Docker/Render/Railway. Cloudflare stays possible later via `NITRO_PRESET=cloudflare-module`.

## 4. Files to change, risks, verification
Files (stage 2 only): `vite.config.ts`, `package.json` (remove Lovable devDependency, add `start` script), `README.md`. Optional later: rename `lovable-error-reporting.ts` (behaviour identical).

Risks:
- Switching config inside Lovable may break the Lovable preview/publish (they expect the wrapper). Mitigation: keep the wrapper in Lovable until you decide to leave; or test on a separate Git branch locally first.
- Plugin order / Nitro beta API differences → build failure (revert is one file).
- Dev port changes from Lovable sandbox defaults.
- No checkout, pricing, tax, payment, storage or UI code is touched.

Verify (Bun):
```sh
bun install && bun run test && bun run build && bun run start
```
Verify (npm): `npm install && npm test && npm run build && npm start` (npm ignores `bun.lock`; versions may drift — first run creates `package-lock.json`).
Manual: open http://localhost:3000, add items, cash checkout, receipt, KDS, reports.

## Staged plan
1. **Stage A (zero code, recommended first, you do it):** clone to VS Code and run the current setup unchanged: `bun install`, `bun run test`, `bun run build`, `bun run dev`. The wrapper is public npm, so this may already work. Report results.
2. **Stage B (me, small):** add a separate `vite.standalone.config.ts` + scripts `build:node` / `start` — Lovable config untouched, so the preview is safe. Run build here and report real output.
3. **Stage C (only when leaving Lovable):** make the standalone config the default, remove the Lovable devDependency, update README.

## Credit impact (estimate)
- Stage A: none.
- Stage B: small — 2 new files/edits plus one build run (~1 short turn).
- Stage C: small — 3 file edits (~1 short turn).

## Safest next step
Stage B. Acceptance: Lovable preview unchanged; `bun run test` passes; `bun run build:node` completes here with output shown; `node .output/server/index.mjs` serves the cashier page and a checkout works in a browser check.

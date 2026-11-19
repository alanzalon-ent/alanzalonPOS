# Alanzalon POS

Point-of-sale web app (cashier, barista/kitchen display, customer display, inventory, admin, reports). Being developed for Saudi coffee shops. Created by Alanzalon Enterprise.

> **Status:** prototype. All data is stored **only in this browser** (localStorage key `alanzalon-pos-v2`). Clearing browser data, private mode, or another device means data is lost. There is no login, server, or backup yet. The admin PIN is a convenience gate, not security. Currency/tax currently default to PHP and 12% VAT; SAR, 15% VAT, Arabic/RTL are planned. No ZATCA compliance is implemented.

## Stack
TanStack Start v1 (React 19), Vite, Tailwind CSS v4, shadcn/Radix UI, TypeScript, Vitest.

## Prerequisites
- [Bun](https://bun.sh) 1.x (lockfile is `bun.lock`), or Node.js 20+ with npm.

## Setup
```sh
git clone <your-repository-url>
cd <repository-folder>
bun install
cp .env.example .env   # optional
```

## Scripts
| Command | Purpose |
| --- | --- |
| `bun run dev` | Start dev server |
| `bun run test` | Run unit tests |
| `bun run lint` | Lint |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |

## Environment variables
| Name | Required | Description |
| --- | --- | --- |
| `VITE_POS_API_URL` | No | Base URL of a POS REST server (`GET /api/products`, `POST /api/orders`, `PATCH /api/orders/:id`). Empty = demo data in browser. Visible in browser code — never put secrets here. |

## Project layout
- `src/routes/` — pages: `/` cashier, `/orders` kitchen display, `/display` customer display, `/inventory`.
- `src/lib/pos-store.ts` — shared state, totals, checkout, persistence.
- `src/lib/pos-api.ts` — optional backend calls.
- `src/components/pos/` — top bar, checkout, admin and reports panels.

## Standalone build (no Lovable packages)
`vite.standalone.config.ts` builds the app for a plain Node.js server, without `@lovable.dev/vite-tanstack-config`. The default `vite.config.ts` is kept for the Lovable preview.

| Command | Purpose |
| --- | --- |
| `bun run dev:node` | Dev server using the standalone config |
| `bun run build:node` | Production build to `.output/` (Nitro `node-server` preset) |
| `bun run start` | Run the build: `node .output/server/index.mjs` (port 3000, override with `PORT`) |

npm works too: `npm install && npm test && npm run build:node && npm start` (npm ignores `bun.lock`, so versions may differ).

Verified in the Lovable sandbox (Bun): tests pass, `build:node` succeeds, and the built server returns HTTP 200 for `/`, `/orders`, `/display`, `/inventory`.
**Not yet verified:** `dev:node`, npm install/build, a clean clone on your machine, checkout in a real browser on the standalone build, and any hosting/deploy target.

## Deployment
The build uses `@lovable.dev/vite-tanstack-config` (public npm package), which targets Cloudflare Workers by default. Running and deploying outside Lovable has not been verified yet; that is the next portability step.

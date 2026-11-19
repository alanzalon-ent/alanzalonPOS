# Phase 1 Audit — Reminder POS → Alanzalon POS (no code changed)

## 1. Stack and structure (verified)
- TanStack Start v1 (React 19, file routing), Vite 8, Tailwind v4, shadcn/Radix UI, TypeScript strict, Vitest. Build target: Cloudflare Worker via `nitro` (configured inside `@lovable.dev/vite-tanstack-config`).
- Entry points: `vite.config.ts`, `src/router.tsx`, `src/start.ts` (error + CSRF middleware), `src/server.ts` (SSR error wrapper), `src/routes/__root.tsx`.
- Routes: `/` cashier (`src/routes/index.tsx`), `/orders` KDS, `/display` customer display, `/inventory`.
- Modules: `src/lib/pos-store.ts` (all state + logic), `src/lib/pos-api.ts` (optional REST hooks), `src/components/pos/{TopNav,CheckoutModal,AdminPanel,ReportsPanel}.tsx`. ~45 shadcn files in `src/components/ui/` (many unused).

## 2. Features to preserve (verified in code)
- Cart: add (stock-capped), +/−, remove, clear, hold/recall.
- Totals `computeTotals`: subtotal → 20% "Senior/PWD" discount → 12% tax on discounted amount, rounded to 2dp.
- Checkout: payment method from configurable list (default Cash/GCash/Card), cash tendered + change, order saved with currency, stock decremented at checkout, order number from 101.
- Receipt popup after payment (`CheckoutModal.tsx`); report printing via `window.print()` (`ReportsPanel.tsx`).
- KDS: Pending → Preparing → Ready → Done.
- Customer display: live cart and total.
- Admin (PIN-gated): store branding/logo, settings (currency PHP/USD, item discounts on/off, payment options), products CRUD, staff and customer lists.
- Reports: daily count/gross/collected, close day, date history.
- Not present: modifiers/sizes/milk/syrups, recipes/ingredients, refunds/voids, audit log, bilingual names.

## 3. Data storage (verified)
- Browser localStorage only, key `alanzalon-pos-v2` (`pos-store.ts` lines 50–97). No database, no `supabase/` folder, Lovable Cloud not enabled.
- `pos-api.ts` calls a REST server only if `VITE_POS_API_URL` is set; no server exists in this repo.
- Data-loss risks: clearing browser data / new device / private mode loses all sales; one device only, no sync; whole state rewritten on every change (storage quota → only a banner); corrupt or old-shape data is silently ignored (resets to demo); no backup/export; failed `postOrder` only flips "Offline", no retry queue.

## 4. Auth / PIN / roles (verified)
- No login, no accounts, no backend. Admin PIN is hard-coded `1234` in browser code (`pos-store.ts` line 76) — visible to anyone, UI-only.
- No roles (Super Admin/Owner/Cashier/Barista) and no tenant isolation exist anywhere.

## 5. Currency, tax, language, time (verified)
- Currency PHP (₱) default, USD option; formatted with `en-PH`. No SAR.
- Tax 12% PH VAT constant (`TAX_RATE`), toggleable by cashier; not configurable; Saudi 15% absent.
- English only, `<html lang="en">`, no RTL, no translation layer.
- Dates use the device's local time (`dayKey`), not Asia/Riyadh.
- No ZATCA features of any kind.

## 6. Dependencies and Lovable lock-in
- Verified Lovable-specific: `@lovable.dev/vite-tanstack-config` (wraps the whole Vite config: plugins, nitro Cloudflare target, aliases); `src/lib/lovable-error-reporting.ts` used in `__root.tsx`; `bunfig.toml` exclusions; Lovable block in `AGENTS.md`.
- No Lovable AI, Cloud, or connectors used. Rest is standard npm packages.
- Assumption (unverified): build works outside Lovable since the config package is public on npm — needs a clean-clone test.

## 7. GitHub readiness
- Git remotes point to Lovable's internal storage; I cannot see whether GitHub is connected — check Project Settings → Git.
- Scripts exist: dev, build, preview, lint, test. Lockfile: `bun.lock` (README says npm — mismatch).
- No `.env.example`; only env var is `VITE_POS_API_URL`. No migrations. Tests: `src/lib/pos-store.test.ts` (still asserts PH 12% VAT and PIN 1234), `src/test/app-routing.test.tsx`.
- README is the original prompt text; no setup, deploy, or backup docs. `roadmap.md` items still unchecked.

## 8. Prioritized migration plan (low risk first)
1. Portability baseline: connect GitHub, clean clone, `bun install && bun run test && bun run build` locally; add `.env.example`, real README (setup, scripts, env, deploy).
2. Replace Lovable build wrapper with plain Vite + TanStack Start config (or keep it and document) — verify identical build.
3. Locale foundation: SAR, configurable VAT 15%, Asia/Riyadh dates, Arabic/English with RTL — keep checkout math under tests.
4. Data model for coffee (modifiers, bilingual names) still local, behind the store.
5. Choose a portable backend (Postgres + auth + per-business isolation, server-enforced roles, audit log); move persistence behind `pos-api.ts`.
6. Inventory recipes, refunds/voids, reports (VAT, COGS).
7. ZATCA work only as a separate validated phase.

## Single safest next step
Portability baseline (step 1), docs and checks only, no app behaviour changes:
- Add `.env.example` (`VITE_POS_API_URL=`) and rewrite README with prerequisites, install, dev, test, build, preview, env vars, and data-storage warning.
- Acceptance: user connects GitHub; clean clone in VS Code runs `bun install`, `bun run test` (all pass), `bun run build` (succeeds) and `bun run dev` shows checkout working — results reported honestly, checkout code untouched.

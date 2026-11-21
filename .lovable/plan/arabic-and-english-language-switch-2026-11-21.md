# Arabic and English language switch

## Goal
Let staff switch the whole POS between English and Arabic. Arabic shows right-to-left. Your choice is remembered on that device.

## What you will see
- A language button (EN / عربي) in the top bar.
- All buttons, labels, tabs, messages, receipts, kitchen screen, customer screen, admin and reports in the chosen language.
- Arabic layout mirrors correctly (cart, menus, icons, numbers stay readable).
- Product names: stay as typed for now. Optional later step: add an Arabic name field per product.

## What does NOT change
Prices, totals, VAT, discounts, payments, stock, order flow, saved sales. Old orders still open. Saved order types ("Dine In" etc.) stay stored in English and are only translated on screen.

## Steps
1. Add a small built-in dictionary (English + Arabic) and a language setting saved with existing settings. No new packages.
2. Set page language and direction (lang="ar" dir="rtl") when Arabic is chosen.
3. Replace fixed text on every screen: top bar, cashier, checkout and receipt, kitchen, customer display, inventory, admin, reports.
4. Fix layout spots that assume left-to-right (margins, arrows, alignment).
5. Arabic font with a clear fallback.
6. Tests: switching language, saved choice after refresh, order types translated, totals unchanged. Run all tests and the standalone build, check Arabic screens on desktop and phone, then commit.

## Technical details
- `src/lib/i18n.ts`: `en`/`ar` dictionaries, `t(key)`, `useT()` reading `settings.language` from pos-store.
- `PosSettings.language: "en" | "ar"`, default "en"; hydrate() defaults legacy data safely.
- Effect in __root sets `document.documentElement.lang/dir` after mount (no SSR mismatch).
- Use logical Tailwind classes (ms/me/ps/pe, text-start).
- Numbers/currency keep Western digits unless you prefer Arabic digits.

## Open choices
- Arabic product names now or later?
- Western (123) or Arabic-Indic (١٢٣) digits?

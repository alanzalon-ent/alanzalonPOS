# POS administration and reports
- [x] Extend shared state with browser-local configuration, records, products and sales persistence.
- [x] Add dynamic store branding and PIN-gated administration panels.
- [x] Add transactions, daily report printing and calendar history (physical printer not verified).
- [x] Connect currency, discounts and payment options to checkout; verify desktop and phone workflows.
- [x] Portability Stage B: standalone Node build config and scripts (Lovable config untouched).

## Order-taking details (current request)
- [x] Add required order type, optional pager number, and independent cart-item notes without changing sale calculations.
- [x] Preserve metadata through hold/recall and refresh; render it in KDS, customer display, receipts, and transaction details.
- [x] Verify compatibility, existing tests, browser flows, and standalone Node build; commit and report results.

## Finish Arabic/English update (current request)
- [x] Finish Admin translations and Arabic font; retain existing product names and Western digits.
- [x] Verify language persistence, unchanged checkout calculations, and Arabic/English desktop and phone screens.
- [x] Run tests (21 passed) and check preview errors (build OK); commit the update.
- Standalone Node production build was not rerun in this task; preview build and browser flows passed.
- Advance ordering remains deferred for future work.

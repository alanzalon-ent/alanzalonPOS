<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- POS state lives in src/lib/pos-store.ts (external store via useSyncExternalStore) so all screens share one live cart/orders; backend calls are isolated in src/lib/pos-api.ts (enabled by VITE_POS_API_URL) to swap demo data for a local REST/Socket.io server.
- Hydrate browser-local POS state after mount and keep administration/report dialogs on the shared store so configuration changes reach every screen without SSR hydration mismatch.
- The frontend PIN is a convenience gate, not a security boundary; staff entries are local cashier records, not authenticated accounts.
- Record currency on each paid order and aggregate report amounts separately by currency so later configuration changes do not relabel historical sales.
- Reports include paid checkouts regardless of kitchen status; gross sales are pre-discount, pre-tax subtotals and collected amounts are final totals.
- Keep order metadata in the existing shared POS store and persisted cart/held/paid records; require an explicit type for new checkouts while displaying legacy missing types as unspecified so old sales remain accessible without inventing history.

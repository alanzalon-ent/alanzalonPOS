import { createFileRoute } from "@tanstack/react-router";
import { TopNav } from "@/components/pos/TopNav";
import { computeTotals, peso, usePos } from "@/lib/pos-store";
import { OrderMetadata } from "@/components/pos/OrderMetadata";

export const Route = createFileRoute("/display")({
  head: () => ({ meta: [
    { title: "Customer Display — Alanzalon Enterprise POS" },
    { name: "description", content: "Customer-facing screen showing scanned items and the amount due." },
    { property: "og:title", content: "Customer Display — Alanzalon Enterprise POS" },
    { property: "og:description", content: "Customer-facing screen showing scanned items and the amount due." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CFD,
});

function CFD() {
  const cart = usePos((s) => s.cart);
  const discountOn = usePos((s) => s.discountOn);
  const taxOn = usePos((s) => s.taxOn);
  const orderType = usePos((s) => s.orderType);
  const pagerNumber = usePos((s) => s.pagerNumber);
  usePos((s) => s.settings.currency);
  const t = computeTotals(cart, discountOn, taxOn);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav />
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 p-4 md:grid-cols-5 md:p-8">
        <section className="rounded-3xl bg-card p-6 shadow-card md:col-span-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Your order</p>
          {cart.length > 0 && <div className="mt-3"><OrderMetadata order={{ orderType, pagerNumber }} /></div>}
          {!cart.length ? (
            <div className="grid h-64 place-items-center text-center">
              <div><div className="text-6xl">☕</div><p className="mt-3 font-display text-2xl font-semibold">Welcome!</p><p className="text-muted-foreground">Your items will appear here.</p></div>
            </div>
          ) : (
            <ul className="mt-4 divide-y">
              {cart.map(({ product: p, qty, note }) => (
                <li key={p.id} className="flex animate-pop items-center gap-4 py-3 text-lg">
                  <span className="text-3xl">{p.emoji}</span><div className="min-w-0 flex-1 font-medium"><span>{p.name}</span>{note && <p dir="auto" className="whitespace-pre-wrap break-words text-start text-sm text-muted-foreground">Special Request: {note}</p>}</div>
                  <span className="text-muted-foreground">×{qty}</span><span className="w-28 text-right font-semibold tabular">{peso(p.price * qty)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="flex flex-col justify-between rounded-3xl bg-shell p-6 text-shell-foreground md:col-span-2">
          <div className="space-y-2 tabular text-shell-muted">
            <div className="flex justify-between"><span>Subtotal</span><span>{peso(t.subtotal)}</span></div>
            {discountOn && <div className="flex justify-between"><span>Discount</span><span>−{peso(t.discount)}</span></div>}
            {taxOn && <div className="flex justify-between"><span>VAT 12%</span><span>{peso(t.tax)}</span></div>}
          </div>
          <div className="mt-10">
            <p className="text-sm uppercase tracking-widest text-shell-muted">Amount due</p>
            <p className="font-display text-5xl font-bold text-primary tabular md:text-6xl">{peso(t.total)}</p>
            <p className="mt-6 text-sm text-shell-muted">Thank you for choosing us! Salamat po.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

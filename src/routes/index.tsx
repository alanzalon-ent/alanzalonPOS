import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Minus, Plus, Trash2, PauseCircle, XCircle, ShoppingBag } from "lucide-react";
import { TopNav } from "@/components/pos/TopNav";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import { computeTotals, peso, pos, usePos, ORDER_TYPES, type Category } from "@/lib/pos-store";
import { Button } from "@/components/ui/button";
import { fetchProducts } from "@/lib/pos-api";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cashier — Alanzalon Enterprise POS" },
      { name: "description", content: "Fast touch-friendly cashier for cafes, restaurants and retail shops." },
      { property: "og:title", content: "Cashier — Alanzalon Enterprise POS" },
      { property: "og:description", content: "Fast touch-friendly cashier for cafes, restaurants and retail shops." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cashier,
});

const cats: ("All" | Category)[] = ["All", "Coffee", "Non-Coffee", "Pastries", "Meals", "Retail"];

function Cashier() {
  const products = usePos((s) => s.products);
  const cart = usePos((s) => s.cart);
  const held = usePos((s) => s.held);
  const discountOn = usePos((s) => s.discountOn);
  const taxOn = usePos((s) => s.taxOn);
  const settings = usePos((s) => s.settings);
  const orderType = usePos((s) => s.orderType);
  const pagerNumber = usePos((s) => s.pagerNumber);
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  const [q, setQ] = useState("");
  const [charging, setCharging] = useState(false);
  const { t: tr } = useT();

  useEffect(() => { fetchProducts().then((p) => p && pos.setProducts(p)).catch(() => pos.setConnected(false)); }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => (cat === "All" || p.category === cat) && (!s || p.name.toLowerCase().includes(s) || p.barcode.includes(s)));
  }, [products, cat, q]);
  const t = computeTotals(cart, discountOn, taxOn);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { const hit = products.find((p) => p.barcode === q.trim()); if (hit) { pos.add(hit); setQ(""); } }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen">
      <TopNav />
      <main className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <section className="flex-1 p-4 lg:basis-[70%] lg:overflow-y-auto">
          <div className="relative">
            <Search className="absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onSearchKey} placeholder={tr("searchProduct")}
              className="w-full rounded-xl border bg-card py-3 ps-11 pe-4 shadow-card outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? "bg-shell text-shell-foreground" : "bg-card text-muted-foreground shadow-card hover:text-foreground"}`}>{tr(c)}</button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {list.map((p) => {
              const out = p.stock <= 0;
              return (
                <button key={p.id} disabled={out} onClick={() => pos.add(p)}
                  className="group flex flex-col rounded-2xl bg-card p-3 text-start shadow-card transition active:scale-[.97] enabled:hover:-translate-y-0.5 disabled:opacity-50">
                  <div className="relative grid aspect-[4/3] place-items-center rounded-xl bg-accent text-5xl transition group-hover:scale-[1.02]">
                    {p.emoji}
                    <span className={`absolute end-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${out ? "bg-destructive text-destructive-foreground" : p.stock < 10 ? "bg-warning text-foreground" : "bg-card text-muted-foreground"}`}>
                      {out ? tr("soldOut") : tr("left", { n: p.stock })}
                    </span>
                  </div>
                  <div className="mt-2.5 line-clamp-1 font-semibold">{p.name}</div>
                  <div className="font-display text-lg font-bold text-primary tabular">{peso(p.price)}</div>
                </button>
              );
            })}
            {!list.length && <p className="col-span-full py-12 text-center text-muted-foreground">{tr("noProducts")}</p>}
          </div>
        </section>

        <aside className="flex flex-col border-t bg-card lg:basis-[30%] lg:border-s lg:border-t-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-display font-semibold">{tr("currentOrder")}</h2>
            <span className="text-sm text-muted-foreground">{tr("items", { n: t.items })}</span>
          </div>
          <div className="space-y-3 border-b px-4 py-3">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{tr("orderType")} <span className="text-destructive">*</span></legend>
              <div className="grid grid-cols-3 gap-2">
                {ORDER_TYPES.map((type) => <Button key={type} variant={orderType === type ? "default" : "outline"} aria-pressed={orderType === type} onClick={() => pos.setOrderType(type)} className="h-auto min-h-10 whitespace-normal px-2">{tr(type)}</Button>)}
              </div>
            </fieldset>
            <div><label htmlFor="pager-number" className="text-sm font-medium">{tr("pagerNo")} <span className="text-muted-foreground">{tr("optional")}</span></label>
              <input id="pager-number" dir="auto" inputMode="numeric" value={pagerNumber} onChange={(e) => pos.setPagerNumber(e.target.value)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          {held.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-b px-4 py-2">
              {held.map((h, i) => (
                <button key={h.id} onClick={() => pos.recall(h.id)} className="shrink-0 rounded-lg bg-accent px-3 py-1 text-xs font-semibold">{tr("held", { n: held.length - i })} · {h.lines.length}</button>
              ))}
            </div>
          )}
          <div className="max-h-56 flex-1 overflow-y-auto px-4 lg:max-h-none">
            {!cart.length ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground"><ShoppingBag className="size-10 opacity-40" /><p className="mt-2 text-sm">{tr("tapToAdd")}</p></div>
            ) : cart.map(({ product: p, qty, note }) => (
              <div key={p.id} className="flex items-center gap-3 border-b py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.name}</div>
                   <div className="text-xs text-muted-foreground tabular">{peso(p.price)} · <span className="font-semibold text-foreground">{peso(p.price * qty)}</span></div>
                   <label htmlFor={`item-note-${p.id}`} className="mt-2 block text-xs text-muted-foreground">{tr("itemNote")}</label>
                   <textarea id={`item-note-${p.id}`} aria-label={tr("specialRequestFor", { name: p.name })} dir="auto" rows={2} value={note ?? ""} onChange={(e) => pos.setItemNote(p.id, e.target.value)} className="mt-1 w-full resize-y rounded-lg border bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex items-center rounded-lg bg-secondary">
                  <button aria-label={tr("decrease")} onClick={() => pos.setQty(p.id, qty - 1)} className="p-2"><Minus className="size-4" /></button>
                  <span className="w-6 text-center text-sm font-bold tabular">{qty}</span>
                  <button aria-label={tr("increase")} onClick={() => pos.setQty(p.id, qty + 1)} className="p-2"><Plus className="size-4" /></button>
                </div>
                <button aria-label={tr("remove")} onClick={() => pos.remove(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t bg-secondary/50 p-4 text-sm tabular">
            <div className="flex gap-2">
              {settings.itemDiscounts && <Toggle on={discountOn} onClick={pos.toggleDiscount}>{tr("seniorDiscount")}</Toggle>}
              <Toggle on={taxOn} onClick={pos.toggleTax}>{tr("vat12")}</Toggle>
            </div>
            <Row label={tr("subtotal")} value={peso(t.subtotal)} />
            {discountOn && <Row label={tr("discount")} value={`−${peso(t.discount)}`} />}
            {taxOn && <Row label={tr("vat")} value={peso(t.tax)} />}
            <div className="flex items-end justify-between pt-1">
              <span className="font-semibold">{tr("total")}</span>
              <span className="font-display text-3xl font-bold">{peso(t.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button disabled={!cart.length} onClick={pos.hold} className="flex items-center justify-center gap-1.5 rounded-xl border bg-card py-2.5 font-semibold disabled:opacity-40"><PauseCircle className="size-4" />{tr("hold")}</button>
              <button disabled={!cart.length} onClick={pos.clear} className="flex items-center justify-center gap-1.5 rounded-xl border bg-card py-2.5 font-semibold text-destructive disabled:opacity-40"><XCircle className="size-4" />{tr("cancel")}</button>
            </div>
             {cart.length > 0 && !orderType && <p className="text-xs text-destructive">{tr("selectOrderType")}</p>}
             <Button disabled={!cart.length || !orderType} onClick={() => setCharging(true)}
               className="h-auto w-full rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-charge transition enabled:hover:brightness-105 enabled:active:scale-[.99] disabled:opacity-40">
              {tr("charge")} {cart.length > 0 && peso(t.total)}
             </Button>
          </div>
        </aside>
      </main>
      {charging && <CheckoutModal total={t.total} onClose={() => setCharging(false)} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span>{value}</span></div>;
}
function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${on ? "border-primary bg-accent text-accent-foreground" : "bg-card text-muted-foreground"}`}>{children}</button>;
}

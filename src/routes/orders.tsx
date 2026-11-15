import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/pos/TopNav";
import { pos, usePos, type Order } from "@/lib/pos-store";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [
    { title: "Kitchen Display — Alanzalon Enterprise POS" },
    { name: "description", content: "Live kitchen display of pending, preparing and ready orders." },
    { property: "og:title", content: "Kitchen Display — Alanzalon Enterprise POS" },
    { property: "og:description", content: "Live kitchen display of pending, preparing and ready orders." },
  ] }),
  component: KDS,
});

const cols: { status: Order["status"]; tone: string; action: string }[] = [
  { status: "Pending", tone: "bg-warning", action: "Start" },
  { status: "Preparing", tone: "bg-info", action: "Mark ready" },
  { status: "Ready", tone: "bg-success", action: "Tap to done" },
];

function KDS() {
  const orders = usePos((s) => s.orders);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(i); }, []);
  return (
    <div className="min-h-screen bg-shell">
      <TopNav />
      <main className="grid gap-4 p-4 md:grid-cols-3">
        {cols.map((c) => {
          const list = orders.filter((o) => o.status === c.status).reverse();
          return (
            <section key={c.status} className="rounded-2xl bg-shell-2 p-3">
              <h2 className="mb-3 flex items-center gap-2 px-1 font-display font-semibold text-shell-foreground">
                <span className={`size-2.5 rounded-full ${c.tone}`} />{c.status}<span className="ml-auto text-sm text-shell-muted">{list.length}</span>
              </h2>
              <div className="space-y-3">
                {list.map((o) => (
                  <button key={o.id} onClick={() => pos.advance(o.id)} className="block w-full animate-pop rounded-xl bg-card p-4 text-left shadow-card transition active:scale-[.98]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-xl font-bold">#{o.number}</span>
                      <span className="text-xs text-muted-foreground">{Math.max(0, Math.floor((now - o.createdAt) / 60000))} min</span>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-sm">{o.lines.map((l) => <li key={l.name}><b>{l.qty}×</b> {l.name}</li>)}</ul>
                    <div className={`mt-3 rounded-lg py-2 text-center text-sm font-bold ${c.tone} text-foreground`}>{c.action}</div>
                  </button>
                ))}
                {!list.length && <p className="py-8 text-center text-sm text-shell-muted">No orders</p>}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

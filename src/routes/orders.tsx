import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/pos/TopNav";
import { pos, usePos, type Order } from "@/lib/pos-store";
import { OrderMetadata } from "@/components/pos/OrderMetadata";
import { Button } from "@/components/ui/button";
import { useT, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [
    { title: "Kitchen Display — Alanzalon Enterprise POS" },
    { name: "description", content: "Live kitchen display of pending, preparing and ready orders." },
    { property: "og:title", content: "Kitchen Display — Alanzalon Enterprise POS" },
    { property: "og:description", content: "Live kitchen display of pending, preparing and ready orders." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: KDS,
});

const cols: { status: Order["status"]; tone: string; action: TKey }[] = [
  { status: "Pending", tone: "bg-warning", action: "start" },
  { status: "Preparing", tone: "bg-info", action: "markReady" },
  { status: "Ready", tone: "bg-success", action: "tapDone" },
];

function KDS() {
  const orders = usePos((s) => s.orders);
  const { t } = useT();
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
                <span className={`size-2.5 rounded-full ${c.tone}`} />{t(c.status as TKey)}<span className="ms-auto text-sm text-shell-muted">{list.length}</span>
              </h2>
              <div className="space-y-3">
                {list.map((o) => (
                  <Button variant="ghost" key={o.id} onClick={() => pos.advance(o.id)} className="block h-auto w-full animate-pop whitespace-normal rounded-xl bg-card p-4 text-start shadow-card transition active:scale-[.98]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-xl font-bold">#{o.number}</span>
                      <span className="text-xs text-muted-foreground">{t("min", { n: Math.max(0, Math.floor((now - o.createdAt) / 60000)) })}</span>
                    </div>
                    <div className="mt-2 border-b pb-2"><OrderMetadata order={o} /></div>
                    <ul className="mt-2 space-y-2 text-sm">{o.lines.map((l, i) => <li key={i}><b>{l.qty}×</b> {l.name}{l.note && <p dir="auto" className="mt-1 whitespace-pre-wrap break-words border-s-2 border-primary ps-2 text-start font-semibold text-accent-foreground">{t("specialRequest")}: {l.note}</p>}</li>)}</ul>
                    <div className={`mt-3 rounded-lg py-2 text-center text-sm font-bold ${c.tone} text-foreground`}>{t(c.action)}</div>
                  </Button>
                ))}
                {!list.length && <p className="py-8 text-center text-sm text-shell-muted">{t("noOrders")}</p>}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

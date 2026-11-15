import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import { TopNav } from "@/components/pos/TopNav";
import { peso, pos, usePos } from "@/lib/pos-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [
    { title: "Inventory — Alanzalon Enterprise POS" },
    { name: "description", content: "Track stock levels and restock products." },
    { property: "og:title", content: "Inventory — Alanzalon Enterprise POS" },
    { property: "og:description", content: "Track stock levels and restock products." },
  ] }),
  component: Inventory,
});

function Inventory() {
  const products = usePos((s) => s.products);
  const low = products.filter((p) => p.stock < 10).length;
  const value = products.reduce((s, p) => s + p.stock * p.price, 0);
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-3 gap-3">
          {[["Products", products.length], ["Low stock", low], ["Stock value", peso(value)]].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs text-muted-foreground">{k}</p><p className="font-display text-lg font-bold tabular sm:text-2xl">{v}</p></div>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-muted-foreground"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Barcode</th><th className="p-3 text-right">Price</th><th className="p-3 text-center">Stock</th></tr></thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-medium"><span className="mr-2">{p.emoji}</span>{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{p.barcode}</td>
                  <td className="p-3 text-right tabular">{peso(p.price)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button aria-label="Decrease stock" onClick={() => pos.restock(p.id, -1)} className="rounded-md bg-secondary p-1.5"><Minus className="size-3.5" /></button>
                      <span className={`w-10 rounded-md py-0.5 text-center font-bold tabular ${p.stock === 0 ? "bg-destructive text-destructive-foreground" : p.stock < 10 ? "bg-warning" : ""}`}>{p.stock}</span>
                      <button aria-label="Increase stock" onClick={() => pos.restock(p.id, 10)} className="rounded-md bg-secondary p-1.5"><Plus className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

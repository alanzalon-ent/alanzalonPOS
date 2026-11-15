import { useState } from "react";
import { Banknote, CreditCard, Smartphone, X, CheckCircle2 } from "lucide-react";
import { peso, pos, type Order, type PaymentMethod } from "@/lib/pos-store";

const methods: { id: PaymentMethod; icon: typeof Banknote }[] = [
  { id: "Cash", icon: Banknote }, { id: "Card", icon: CreditCard }, { id: "E-Wallet", icon: Smartphone },
];

export function CheckoutModal({ total, onClose }: { total: number; onClose: () => void }) {
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [tendered, setTendered] = useState("");
  const [receipt, setReceipt] = useState<Order | null>(null);
  const cash = parseFloat(tendered) || 0;
  const change = cash - total;
  const canPay = method !== "Cash" || cash >= total;
  const quick = [Math.ceil(total), Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, 1000].filter((v, i, a) => a.indexOf(v) === i && v >= total);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-shell/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-pop rounded-2xl bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        {receipt ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <h2 className="mt-3 font-display text-xl font-semibold">Payment successful</h2>
            <p className="text-sm text-muted-foreground">Order #{receipt.number} sent to kitchen</p>
            <div className="mt-5 space-y-1 rounded-xl border border-dashed p-4 text-left text-sm tabular">
              {receipt.lines.map((l) => (
                <div key={l.name} className="flex justify-between"><span>{l.qty}× {l.name}</span><span>{peso(l.qty * l.price)}</span></div>
              ))}
              <div className="my-2 border-t border-dashed" />
              {receipt.discount > 0 && <div className="flex justify-between text-muted-foreground"><span>Discount</span><span>−{peso(receipt.discount)}</span></div>}
              {receipt.tax > 0 && <div className="flex justify-between text-muted-foreground"><span>VAT 12%</span><span>{peso(receipt.tax)}</span></div>}
              <div className="flex justify-between font-bold"><span>Total</span><span>{peso(receipt.total)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>{receipt.method}</span><span>{peso(receipt.tendered)}</span></div>
              {receipt.change > 0 && <div className="flex justify-between font-semibold text-success"><span>Change</span><span>{peso(receipt.change)}</span></div>}
            </div>
            <button onClick={onClose} className="mt-5 w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">New sale</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Charge</h2>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="mt-2 font-display text-4xl font-bold tabular">{peso(total)}</div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {methods.map(({ id, icon: Icon }) => (
                <button key={id} onClick={() => setMethod(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-sm font-semibold transition ${method === id ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}>
                  <Icon className="size-5" />{id}
                </button>
              ))}
            </div>
            {method === "Cash" ? (
              <div className="mt-5">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="tendered">Cash tendered</label>
                <input id="tendered" inputMode="decimal" autoFocus value={tendered} onChange={(e) => setTendered(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0.00" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 font-display text-2xl tabular outline-none focus:ring-2 focus:ring-ring" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {quick.map((v) => <button key={v} onClick={() => setTendered(String(v))} className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium tabular">{peso(v)}</button>)}
                </div>
                <div className={`mt-4 flex justify-between rounded-xl px-4 py-3 font-semibold tabular ${change >= 0 && cash > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  <span>Change</span><span>{cash > 0 ? peso(Math.max(0, change)) : "—"}</span>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                {method === "Card" ? "Tap, insert, or swipe card on the terminal." : "Ask customer to scan the GCash / Maya QR code."}
              </p>
            )}
            <button disabled={!canPay} onClick={() => setReceipt(pos.checkout(method, cash))}
              className="mt-5 w-full rounded-xl bg-success py-4 text-lg font-bold text-success-foreground shadow-charge transition enabled:hover:brightness-105 disabled:opacity-40">
              Confirm payment
            </button>
          </>
        )}
      </div>
    </div>
  );
}

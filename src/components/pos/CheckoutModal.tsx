import { useState } from "react";
import { Banknote, CreditCard, Smartphone, X, CheckCircle2 } from "lucide-react";
import { peso, pos, usePos, type Order, type PaymentMethod } from "@/lib/pos-store";
import { Button } from "@/components/ui/button";

export function CheckoutModal({ total, onClose }: { total: number; onClose: () => void }) {
  const settings = usePos((s) => s.settings);
  const store = usePos((s) => s.store);
  const methods = settings.paymentOptions.map((id) => ({ id, icon: id.toLowerCase() === "cash" ? Banknote : id.toLowerCase() === "card" ? CreditCard : Smartphone }));
  const [method, setMethod] = useState<PaymentMethod>(settings.paymentOptions[0] ?? "Cash");
  const [tendered, setTendered] = useState("");
  const [receipt, setReceipt] = useState<Order | null>(null);
  const cash = parseFloat(tendered) || 0;
  const change = cash - total;
  const cashPayment = method.toLowerCase() === "cash";
  const canPay = settings.paymentOptions.includes(method) && (!cashPayment || cash >= total);
  const quick = [Math.ceil(total), Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500, 1000].filter((v, i, a) => a.indexOf(v) === i && v >= total);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-shell/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-pop rounded-2xl bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        {receipt ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <h2 className="mt-3 font-display text-xl font-semibold">Payment successful</h2>
            <p className="mt-1 font-semibold">{store.name}</p>
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
            <Button onClick={onClose} className="mt-5 h-auto w-full py-3 font-semibold">New sale</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Charge</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close"><X /></Button>
            </div>
            <div className="mt-2 font-display text-4xl font-bold tabular">{peso(total)}</div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {methods.map(({ id, icon: Icon }) => (
                <Button variant="outline" key={id} onClick={() => setMethod(id)}
                  className={`h-auto flex-col gap-1.5 whitespace-normal break-words border-2 py-3 text-sm font-semibold ${method === id ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}>
                  <Icon className="size-5" />{id}
                </Button>
              ))}
            </div>
            {cashPayment ? (
              <div className="mt-5">
                <label className="text-sm font-medium text-muted-foreground" htmlFor="tendered">Cash tendered</label>
                <input id="tendered" inputMode="decimal" autoFocus value={tendered} onChange={(e) => setTendered(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder="0.00" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 font-display text-2xl tabular outline-none focus:ring-2 focus:ring-ring" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {quick.map((v) => <Button variant="secondary" key={v} onClick={() => setTendered(String(v))} className="tabular">{peso(v)}</Button>)}
                </div>
                <div className={`mt-4 flex justify-between rounded-xl px-4 py-3 font-semibold tabular ${change >= 0 && cash > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  <span>Change</span><span>{cash > 0 ? peso(Math.max(0, change)) : "—"}</span>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                {method} payment
              </p>
            )}
            <Button disabled={!canPay} onClick={() => setReceipt(pos.checkout(method, cash))}
              className="mt-5 h-auto w-full bg-success py-4 text-lg font-bold text-success-foreground shadow-charge hover:bg-success/90">
              Confirm payment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Printer, ReceiptText, Sun, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { dayKey, peso, pos, salesForDate, usePos, type Currency, type Order } from "@/lib/pos-store";
import { OrderMetadata } from "./OrderMetadata";

export function ReportsPanel({ onClose }: { onClose: () => void }) {
  const orders = usePos((s) => s.orders);
  const store = usePos((s) => s.store);
  const currency = usePos((s) => s.settings.currency);
  const closedDays = usePos((s) => s.closedDays);
  const [tab, setTab] = useState("Latest Transactions");
  const [date, setDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const reportDate = tab === "End of Day" ? new Date() : date;
  const daily = salesForDate(orders, reportDate);
  const reportOrders = tab === "Latest Transactions" ? orders : daily.transactions;
  const currencies: Currency[] = ["PHP", "USD"];
  function printReport() {
    const originalTitle = document.title;
    document.title = `${store.name} — EOD ${dayKey(reportDate)}`;
    setPrinting(true);
    // Give React a frame to reveal the isolated printable report.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print();
      document.title = originalTitle;
      setPrinting(false);
      if (tab === "End of Day") pos.closeDay(reportDate);
    }));
  }
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="flex h-[min(780px,92dvh)] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-lg p-0">
      <header className="border-b px-5 py-4 pr-12"><DialogTitle className="font-display">Reports & Transactions</DialogTitle><DialogDescription className="mt-1 truncate">{store.name}</DialogDescription></header>
      <nav aria-label="Report sections" className="flex shrink-0 gap-1 overflow-x-auto border-b bg-secondary/50 p-2">{[["Latest Transactions", ReceiptText], ["End of Day", Sun], ["Calendar History", CalendarDays]].map(([name, Icon]) => { const TabIcon = Icon as typeof ReceiptText; return <Button key={String(name)} variant={tab === name ? "default" : "ghost"} className="shrink-0" onClick={() => setTab(String(name))}><TabIcon />{String(name)}</Button>; })}</nav>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {tab === "Calendar History" && <div className="mb-5"><Popover open={calendarOpen} onOpenChange={setCalendarOpen}><PopoverTrigger asChild><Button variant="outline" className="w-full justify-start sm:w-auto"><CalendarIcon />{format(date, "PPP")}</Button></PopoverTrigger><PopoverContent className="pointer-events-auto w-auto p-0" align="start"><Calendar mode="single" selected={date} defaultMonth={date} onSelect={(value) => { if (value) { setDate(value); setCalendarOpen(false); } }} className="pointer-events-auto p-3" /></PopoverContent></Popover></div>}
        {tab !== "Latest Transactions" && <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-lg font-semibold">{format(reportDate, "MMMM d, yyyy")}</h2>{closedDays.includes(dayKey(reportDate)) && <p className="mt-1 text-xs font-medium text-success">EOD report issued</p>}</div><Button onClick={printReport}><Printer />{tab === "End of Day" ? "End of Day / Print Report" : "Print report"}</Button></div>
          <div className="mb-6 rounded-lg border bg-card p-4"><p className="mb-4 text-sm text-muted-foreground">Total transactions <b className="float-right text-lg text-foreground tabular">{daily.count}</b></p><div className="space-y-4">{currencies.filter((c) => daily.transactions.some((o) => (o.currency ?? "PHP") === c) || c === currency).map((c) => { const group = daily.transactions.filter((o) => (o.currency ?? "PHP") === c); return <div key={c} className="grid grid-cols-2 gap-4 border-t pt-4"><div><p className="text-xs text-muted-foreground">Gross sales · {c}</p><p className="mt-1 break-words font-display text-xl font-bold tabular">{peso(group.reduce((s, o) => s + o.subtotal, 0), c)}</p></div><div><p className="text-xs text-muted-foreground">Collected · {c}</p><p className="mt-1 break-words font-display text-xl font-bold text-success tabular">{peso(group.reduce((s, o) => s + o.total, 0), c)}</p></div></div>; })}</div></div>
        </>}
        <div className="mb-3 flex justify-between text-sm"><h2 className="font-semibold">{tab === "Latest Transactions" ? "Latest Transactions" : "Transaction log"}</h2><span className="text-muted-foreground">{reportOrders.length} transactions</span></div>
        <TransactionList orders={reportOrders} />
      </div>
      {printing && <div className="pos-print-report"><h1>{store.name}</h1><p>{store.address}</p><h2>End of Day — {format(reportDate, "MMMM d, yyyy")}</h2><p>Total transactions: {daily.count}</p>{currencies.map((c) => { const group = daily.transactions.filter((o) => (o.currency ?? "PHP") === c); return group.length > 0 && <div key={c}><p>Gross sales ({c}): {peso(group.reduce((s, o) => s + o.subtotal, 0), c)}</p><p>Collected ({c}): {peso(group.reduce((s, o) => s + o.total, 0), c)}</p></div>; })}<TransactionList orders={daily.transactions} expandAll /><p>Alanzalon Enterprise</p></div>}
    </DialogContent>
  </Dialog>;
}

function TransactionList({ orders, expandAll = false }: { orders: Order[]; expandAll?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <div className="divide-y border-y">{orders.map((o) => <div key={o.id} className="py-3"><Button variant="ghost" className="h-auto w-full justify-between gap-3 whitespace-normal px-0 py-1 text-left" onClick={() => setExpanded(expanded === o.id ? null : o.id)} aria-expanded={expanded === o.id}><span className="min-w-0"><span className="block font-semibold">Order #{o.number}</span><span className="block text-xs font-normal text-muted-foreground">{format(o.createdAt, "MMM d, h:mm a")} · {o.lines.reduce((s, l) => s + l.qty, 0)} items · {o.method}</span></span><span className="shrink-0 font-display font-bold tabular">{peso(o.total, o.currency ?? "PHP")}</span></Button>{(expandAll || expanded === o.id) && <div className="mt-2 space-y-1 border-l-2 border-primary pl-3 text-sm"><OrderMetadata order={o} />{o.lines.map((l, i) => <div key={i} className="flex justify-between gap-3"><div className="min-w-0"><span>{l.qty} × {l.name}</span>{l.note && <p dir="auto" className="whitespace-pre-wrap break-words text-start text-xs font-medium text-muted-foreground">Special Request: {l.note}</p>}</div><span className="shrink-0 tabular">{peso(l.qty * l.price, o.currency ?? "PHP")}</span></div>)}<p className="pt-2 text-xs text-muted-foreground">Discount {peso(o.discount, o.currency ?? "PHP")} · Tax {peso(o.tax, o.currency ?? "PHP")}</p></div>}</div>)}{!orders.length && <div className="py-16 text-center"><ReceiptText className="mx-auto mb-3 size-9 text-muted-foreground" /><p className="text-sm text-muted-foreground">No transactions for this period</p></div>}</div>;
}

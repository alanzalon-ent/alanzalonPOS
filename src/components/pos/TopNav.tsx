import { Link } from "@tanstack/react-router";
import { LayoutGrid, ChefHat, MonitorSmartphone, Boxes } from "lucide-react";
import { pos, usePos } from "@/lib/pos-store";

const tabs = [
  { to: "/", label: "Cashier", icon: LayoutGrid },
  { to: "/orders", label: "Active Orders", icon: ChefHat },
  { to: "/display", label: "Customer Display", icon: MonitorSmartphone },
  { to: "/inventory", label: "Inventory", icon: Boxes },
] as const;

export function TopNav() {
  const connected = usePos((s) => s.connected);
  const pending = usePos((s) => s.orders.filter((o) => o.status !== "Done").length);
  return (
    <header className="sticky top-0 z-30 bg-shell text-shell-foreground">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">A</div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold sm:text-base">Alanzalon Enterprise POS</div>
            <button onClick={() => pos.setConnected(!connected)} className="flex items-center gap-1.5 text-xs text-shell-muted" title="Toggle connection (demo)">
              <span className={`size-2 rounded-full ${connected ? "bg-success animate-pulse" : "bg-destructive"}`} />
              {connected ? "Connected" : "Offline"}
            </button>
          </div>
        </div>
        <nav className="order-last flex w-full gap-1 overflow-x-auto md:order-none md:ml-auto md:w-auto">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-shell-muted transition hover:bg-shell-2 hover:text-shell-foreground"
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}>
              <Icon className="size-4" />{label}
              {to === "/orders" && pending > 0 && <span className="rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">{pending}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { LayoutGrid, ChefHat, MonitorSmartphone, Boxes, LockKeyhole, Settings, Languages, type LucideIcon } from "lucide-react";
import { useT, type TKey } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdminPanel } from "./AdminPanel";
import { ReportsPanel } from "./ReportsPanel";
import { pos, usePos } from "@/lib/pos-store";

const tabs = [
  { to: "/", label: "cashier", icon: LayoutGrid },
  { to: "/orders", label: "activeOrders", icon: ChefHat },
  { to: "/display", label: "customerDisplay", icon: MonitorSmartphone },
  { to: "/inventory", label: "inventory", icon: Boxes },
] as const satisfies readonly { to: string; label: TKey; icon: LucideIcon }[];

export function TopNav() {
  const [panel, setPanel] = useState<"admin" | "reports" | null>(null);
  const store = usePos((s) => s.store);
  const storageError = usePos((s) => s.storageError);
  const [logoFailed, setLogoFailed] = useState(false);
  const { t, lang, dir } = useT();
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = dir; }, [lang, dir]);
  useEffect(() => { pos.hydrate(); }, []);
  useEffect(() => { setLogoFailed(false); }, [store.logo]);
  const connected = usePos((s) => s.connected);
  const pending = usePos((s) => s.orders.filter((o) => o.status !== "Done").length);
  return (
    <header className="sticky top-0 z-30 bg-shell text-shell-foreground">
      <div className="flex flex-wrap items-center gap-3 px-4 py-2.5">
        <div className="flex min-w-0 basis-full items-center gap-2.5 sm:flex-1 sm:basis-auto">
          {store.logo && !logoFailed ? <img src={store.logo} alt={`${store.name} logo`} className="size-10 shrink-0 rounded-lg bg-card object-contain" onError={() => setLogoFailed(true)} /> : <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">{store.name.charAt(0).toUpperCase()}</div>}
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-sm font-semibold sm:text-base">{store.name}</div>
            <div className="mt-1 text-[10px] text-shell-muted">{t("by")} <bdi className="font-semibold text-shell-foreground">Alanzalon Enterprise</bdi></div>
            <Button variant="ghost" size="sm" onClick={() => pos.setConnected(!connected)} className="mt-0.5 h-auto justify-start gap-1.5 p-0 text-xs text-shell-muted hover:bg-transparent hover:text-shell-foreground" title={t("toggleConnection")}>
              <span className={`size-2 rounded-full ${connected ? "bg-success animate-pulse" : "bg-destructive"}`} />
              {connected ? t("connected") : t("offline")}
            </Button>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" onClick={() => pos.setLanguage(lang === "ar" ? "en" : "ar")} className="gap-1.5 px-3" aria-label={t("language")} lang={lang === "ar" ? "en" : "ar"}><Languages />{t("language")}</Button>
          <Button onClick={() => setPanel("admin")} className="gap-1.5 px-3"><LockKeyhole />{t("admin")}</Button>
          <Button variant="secondary" onClick={() => setPanel("reports")} className="gap-1.5 px-3" aria-label={t("settingsReports")}><Settings /><span className="hidden sm:inline">{t("settingsReports")}</span><span className="sm:hidden">{t("reports")}</span></Button>
        </div>
        <nav className="order-last flex w-full gap-1 overflow-x-auto">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-shell-muted transition hover:bg-shell-2 hover:text-shell-foreground"
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}>
              <Icon className="size-4" />{t(label)}
              {to === "/orders" && pending > 0 && <span className="rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">{pending}</span>}
            </Link>
          ))}
        </nav>
      </div>
      {storageError && <p role="alert" className="bg-destructive px-4 py-2 text-xs text-destructive-foreground">{t("storageError")}</p>}
      {panel === "admin" && <AdminPanel onClose={() => setPanel(null)} />}
      {panel === "reports" && <ReportsPanel onClose={() => setPanel(null)} />}
    </header>
  );
}

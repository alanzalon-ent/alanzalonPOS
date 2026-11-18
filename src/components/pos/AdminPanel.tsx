import { useState, type FormEvent } from "react";
import { Building2, Boxes, Settings2, Users, Contact, LockKeyhole, Plus, Pencil, Trash2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { peso, pos, usePos, validAdminPin, type Product, type Category, type Currency } from "@/lib/pos-store";

const sections = [
  { name: "Store Details", icon: Building2 },
  { name: "Product Details & Inventory", icon: Boxes },
  { name: "POS Settings", icon: Settings2 },
  { name: "Staffs Management", icon: Users },
  { name: "Customer Details", icon: Contact },
] as const;

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<string>("Store Details");
  const store = usePos((s) => s.store);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className={unlocked ? "flex h-[min(780px,92dvh)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-lg p-0" : "w-[calc(100%-1.5rem)] max-w-sm rounded-lg"}>
      {!unlocked ? <>
        <div className="mx-auto grid size-14 place-items-center rounded-lg bg-accent text-accent-foreground"><LockKeyhole className="size-7" /></div>
        <DialogTitle className="text-center font-display">Admin access</DialogTitle>
        <DialogDescription className="text-center">{store.name}</DialogDescription>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (validAdminPin(pin)) { setUnlocked(true); setError(""); } else { setError("Incorrect PIN. Try again."); setPin(""); } }}>
          <label className="block text-sm font-medium" htmlFor="admin-pin">4-digit PIN</label>
          <Input id="admin-pin" type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }} className="h-14 text-center text-2xl" autoFocus />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button className="w-full" type="submit" disabled={pin.length !== 4}><LockKeyhole />Unlock admin</Button>
        </form>
      </> : <>
        <header className="border-b px-5 py-4 pr-12"><DialogTitle className="font-display">Administration</DialogTitle><DialogDescription className="mt-1 truncate">{store.name} · Alanzalon Enterprise</DialogDescription></header>
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav aria-label="Admin sections" className="flex shrink-0 gap-1 overflow-x-auto border-b bg-secondary/50 p-2 md:w-56 md:flex-col md:border-r md:border-b-0">
            {sections.map(({ name, icon: Icon }) => <Button key={name} variant={tab === name ? "default" : "ghost"} className="h-auto shrink-0 justify-start whitespace-normal px-3 py-3 text-left md:w-full" onClick={() => setTab(name)}><Icon /><span>{name}</span></Button>)}
          </nav>
          <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <h2 className="mb-5 font-display text-xl font-semibold">{tab}</h2>
            {tab === "Store Details" && <StoreForm />}
            {tab === "Product Details & Inventory" && <ProductManager />}
            {tab === "POS Settings" && <SettingsForm />}
            {tab === "Staffs Management" && <PeopleManager kind="staff" />}
            {tab === "Customer Details" && <PeopleManager kind="customers" />}
          </div>
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}

function StoreForm() {
  const store = usePos((s) => s.store);
  const [draft, setDraft] = useState(store);
  const [saved, setSaved] = useState(false);
  const fields = [["name", "Store Name"], ["owner", "Owner Name"], ["logo", "Logo URL/Path"], ["address", "Address"], ["contact", "Contact Number"], ["instagram", "Instagram handle"]] as const;
  return <form onSubmit={(e) => { e.preventDefault(); pos.updateStore({ ...draft, name: draft.name.trim() }); setSaved(true); }} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="space-y-2 text-sm font-medium"><span>{label}</span><Input required={key === "name"} value={draft[key]} onChange={(e) => { setDraft({ ...draft, [key]: e.target.value }); setSaved(false); }} maxLength={key === "logo" ? 1000 : 200} type={key === "contact" ? "tel" : "text"} /></label>)}</div>
    <div className="flex items-center gap-3"><Button type="submit" disabled={!draft.name.trim()}><Save />Save store details</Button>{saved && <span role="status" className="text-sm text-success">Saved</span>}</div>
  </form>;
}

function ProductManager() {
  const products = usePos((s) => s.products);
  usePos((s) => s.settings.currency);
  const [draft, setDraft] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const blank = (): Product => ({ id: crypto.randomUUID(), name: "", category: "Coffee", price: 0, stock: 0, barcode: "", emoji: "🛍️" });
  const categories: Category[] = ["Coffee", "Non-Coffee", "Pastries", "Meals", "Retail"];
  const units = products.reduce((sum, p) => sum + p.stock, 0);
  const value = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  function save(e: FormEvent) {
    e.preventDefault(); if (!draft || !draft.name.trim()) return;
    if (draft.barcode && products.some((p) => p.id !== draft.id && p.barcode === draft.barcode.trim())) { setMessage("Barcode is already assigned to another product."); return; }
    pos.saveProduct({ ...draft, name: draft.name.trim(), barcode: draft.barcode.trim() }); setDraft(null); setMessage("Product saved.");
  }
  return <div className="space-y-5">
    <div><h3 className="mb-3 text-sm font-semibold text-muted-foreground">Inventory Stock Report</h3><div className="grid grid-cols-2 gap-3 border-y py-4 sm:grid-cols-4">{[["Products", products.length], ["Units in stock", units], ["Low / out of stock", products.filter((p) => p.stock < 10).length], ["Stock retail value", peso(value)]].map(([label, v]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words font-display text-lg font-bold tabular">{v}</p></div>)}</div></div>
    {draft ? <form className="space-y-4" onSubmit={save}>
      <Button variant="ghost" type="button" onClick={() => { setDraft(null); setMessage(""); }}><ArrowLeft />Back to products</Button>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">Product name<Input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
        <label className="space-y-2 text-sm font-medium">Category<Select value={draft.category} onValueChange={(category: Category) => setDraft({ ...draft, category })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem value={c} key={c}>{c}</SelectItem>)}</SelectContent></Select></label>
        <label className="space-y-2 text-sm font-medium">Price<Input required type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></label>
        <label className="space-y-2 text-sm font-medium">Stock<Input required type="number" min="0" step="1" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} /></label>
        <label className="space-y-2 text-sm font-medium">Barcode<Input value={draft.barcode} onChange={(e) => setDraft({ ...draft, barcode: e.target.value })} /></label>
        <label className="space-y-2 text-sm font-medium">Product symbol<Input maxLength={12} value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} /></label>
      </div>
      <Button type="submit"><Save />Save product</Button>
    </form> : <>
      <div className="flex flex-wrap items-center gap-3"><Input aria-label="Search inventory" placeholder="Search inventory…" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1" /><Button onClick={() => { setDraft(blank()); setMessage(""); }}><Plus />Add product</Button></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-muted-foreground"><tr><th className="py-3 pr-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Actions</th></tr></thead><tbody className="divide-y">{products.filter((p) => `${p.name} ${p.barcode}`.toLowerCase().includes(query.toLowerCase())).map((p) => <tr key={p.id}><td className="py-3 pr-3"><p className="font-medium">{p.emoji} {p.name}</p><p className="text-xs text-muted-foreground">{p.category} · {p.barcode || "No barcode"}</p></td><td className="p-3 tabular">{peso(p.price)}</td><td className={`p-3 font-semibold tabular ${p.stock < 10 ? "text-destructive" : "text-success"}`}>{p.stock}</td><td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} title="Edit product" onClick={() => { setDraft({ ...p }); setMessage(""); }}><Pencil /></Button><Button variant="ghost" size="icon" className="text-destructive" aria-label={`Remove ${p.name}`} title="Remove product" onClick={() => setDeleting(p.id)}><Trash2 /></Button></div>{deleting === p.id && <div className="mt-2 space-y-2"><p className="text-xs">Remove this product?</p><Button variant="destructive" size="sm" onClick={() => { pos.deleteProduct(p.id); setDeleting(null); }}>Remove</Button><Button variant="ghost" size="sm" onClick={() => setDeleting(null)}>Keep</Button></div>}</td></tr>)}</tbody></table>{!products.length && <p className="py-8 text-center text-muted-foreground">No products</p>}</div>
    </>}
    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
  </div>;
}

function SettingsForm() {
  const settings = usePos((s) => s.settings);
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  return <form className="max-w-lg space-y-6" onSubmit={(e) => { e.preventDefault(); const options = draft.paymentOptions.map((p) => p.trim()); if (!options.length || options.some((p) => !p) || new Set(options.map((p) => p.toLowerCase())).size !== options.length) { setError("Add at least one payment option. Names must be unique and not empty."); return; } pos.updateSettings({ ...draft, paymentOptions: options }); setSaved(true); setError(""); }}>
    <div className="flex items-center justify-between border-b pb-4"><label htmlFor="discount-enabled" className="text-sm font-medium">Item Discounts</label><Switch id="discount-enabled" checked={draft.itemDiscounts} onCheckedChange={(itemDiscounts) => { setDraft({ ...draft, itemDiscounts }); setSaved(false); }} /></div>
    <label className="block space-y-2 text-sm font-medium">Currency<Select value={draft.currency} onValueChange={(currency: Currency) => { setDraft({ ...draft, currency }); setSaved(false); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PHP">PHP / ₱</SelectItem><SelectItem value="USD">USD / $</SelectItem></SelectContent></Select></label>
    <div className="space-y-3"><h3 className="text-sm font-semibold">Payment Options</h3>{draft.paymentOptions.map((option, i) => <div key={i} className="flex gap-2"><Input aria-label={`Payment option ${i + 1}`} value={option} maxLength={40} onChange={(e) => { setDraft({ ...draft, paymentOptions: draft.paymentOptions.map((p, j) => j === i ? e.target.value : p) }); setSaved(false); }} /><Button type="button" variant="ghost" size="icon" aria-label={`Remove payment option ${i + 1}`} title="Remove payment option" onClick={() => { setDraft({ ...draft, paymentOptions: draft.paymentOptions.filter((_, j) => j !== i) }); setSaved(false); }}><Trash2 /></Button></div>)}<Button type="button" variant="outline" onClick={() => { setDraft({ ...draft, paymentOptions: [...draft.paymentOptions, ""] }); setSaved(false); }}><Plus />Add payment option</Button></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex items-center gap-3"><Button type="submit"><Save />Save POS settings</Button>{saved && <span role="status" className="text-sm text-success">Saved</span>}</div>
  </form>;
}

function PeopleManager({ kind }: { kind: "staff" | "customers" }) {
  const people = usePos((s) => s[kind]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const noun = kind === "staff" ? "staff" : "customer";
  return <div className="space-y-5">
    <form className="grid items-end gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; pos.addPerson(kind, name.trim(), contact.trim()); setName(""); setContact(""); }}>
      <label className="space-y-2 text-sm font-medium">{kind === "staff" ? "Cashier name" : "Customer name"}<Input required value={name} maxLength={100} onChange={(e) => setName(e.target.value)} /></label>
      <label className="space-y-2 text-sm font-medium">Contact / email<Input value={contact} maxLength={200} onChange={(e) => setContact(e.target.value)} /></label>
      <Button type="submit" disabled={!name.trim()} className="justify-self-start"><Plus />Add {noun}</Button>
    </form>
    <div className="border-t pt-4"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">{people.length} {kind === "staff" ? "cashiers" : "customers"}</h3><Input className="max-w-xs" aria-label={`Search ${kind}`} placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <ul className="divide-y">{people.filter((p) => `${p.name} ${p.contact}`.toLowerCase().includes(query.toLowerCase())).map((p) => <li key={p.id} className="flex flex-wrap items-center gap-3 py-3"><div className="min-w-0 flex-1"><p className="break-words font-medium">{p.name}</p><p className="break-words text-sm text-muted-foreground">{p.contact || "—"}</p></div>{deleting === p.id ? <div className="flex gap-1"><Button size="sm" variant="destructive" onClick={() => { pos.removePerson(kind, p.id); setDeleting(null); }}>Remove</Button><Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>Keep</Button></div> : <Button variant="ghost" size="icon" className="text-destructive" aria-label={`Remove ${p.name}`} title={`Remove ${noun}`} onClick={() => setDeleting(p.id)}><Trash2 /></Button>}</li>)}</ul>
      {!people.length && <div className="py-10 text-center text-sm text-muted-foreground">No {kind === "staff" ? "cashiers" : "customers"} yet</div>}
    </div>
  </div>;
}

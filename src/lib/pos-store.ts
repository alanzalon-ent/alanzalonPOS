import { useSyncExternalStore } from "react";
import { patchOrderStatus, postOrder } from "./pos-api";

export type Category = "Coffee" | "Non-Coffee" | "Pastries" | "Meals" | "Retail";
export interface Product { id: string; name: string; category: Category; price: number; stock: number; barcode: string; emoji: string; }
export interface CartLine { product: Product; qty: number; note?: string; }
export const ORDER_TYPES = ["Dine In", "Take Out", "Delivery"] as const;
export type OrderType = (typeof ORDER_TYPES)[number];
export const isOrderType = (value: unknown): value is OrderType => ORDER_TYPES.some((type) => type === value);
export const orderTypeLabel = (value: unknown) => isOrderType(value) ? value : "Not specified";
export type PaymentMethod = string;
export type Currency = "PHP" | "USD";
export interface StoreDetails { name: string; owner: string; logo: string; address: string; contact: string; instagram: string; }
export interface PosSettings { itemDiscounts: boolean; currency: Currency; paymentOptions: string[]; }
export interface PersonRecord { id: string; name: string; contact: string; }
export interface Order {
  id: string; number: number; lines: { name: string; qty: number; price: number; note?: string }[];
  orderType?: OrderType | null; pagerNumber?: string;
  subtotal: number; discount: number; tax: number; total: number;
  method: PaymentMethod; tendered: number; change: number;
  status: "Pending" | "Preparing" | "Ready" | "Done"; createdAt: number; currency?: Currency;
}
export interface HeldOrder { id: string; lines: CartLine[]; at: number; orderType?: OrderType | null; pagerNumber?: string; }

export const TAX_RATE = 0.12; // PH VAT
export const DISCOUNT_RATE = 0.2; // Senior/PWD

const P = (id: string, name: string, category: Category, price: number, stock: number, emoji: string): Product =>
  ({ id, name, category, price, stock, emoji, barcode: `4800${id.padStart(6, "0")}` });

export const seedProducts: Product[] = [
  P("1", "Americano", "Coffee", 120, 48, "☕"), P("2", "Café Latte", "Coffee", 150, 36, "🥛"),
  P("3", "Spanish Latte", "Coffee", 165, 22, "🍮"), P("4", "Caramel Macchiato", "Coffee", 175, 8, "🍯"),
  P("5", "Cold Brew", "Coffee", 160, 14, "🧊"), P("6", "Matcha Latte", "Non-Coffee", 170, 18, "🍵"),
  P("7", "Chocolate", "Non-Coffee", 140, 25, "🍫"), P("8", "Strawberry Milk", "Non-Coffee", 155, 4, "🍓"),
  P("9", "Calamansi Juice", "Non-Coffee", 95, 30, "🍋"), P("10", "Butter Croissant", "Pastries", 95, 12, "🥐"),
  P("11", "Ensaymada", "Pastries", 85, 20, "🧁"), P("12", "Blueberry Muffin", "Pastries", 90, 0, "🫐"),
  P("13", "Cinnamon Roll", "Pastries", 110, 9, "🌀"), P("14", "Chicken Adobo Rice", "Meals", 220, 15, "🍛"),
  P("15", "Tapsilog", "Meals", 240, 11, "🍳"), P("16", "Club Sandwich", "Meals", 210, 7, "🥪"),
  P("17", "Coffee Beans 250g", "Retail", 450, 16, "🫘"), P("18", "Tumbler", "Retail", 590, 6, "🥤"),
];

interface State {
  products: Product[]; cart: CartLine[]; orders: Order[]; held: HeldOrder[];
  discountOn: boolean; taxOn: boolean; connected: boolean; nextNumber: number;
  store: StoreDetails; settings: PosSettings; staff: PersonRecord[]; customers: PersonRecord[];
  closedDays: string[]; storageError: boolean;
  orderType: OrderType | null; pagerNumber: string;
}
const initialState: State = { products: seedProducts, cart: [], orders: [], held: [], discountOn: false, taxOn: true, connected: true, nextNumber: 101,
  store: { name: "Your Store", owner: "", logo: "", address: "", contact: "", instagram: "" },
  settings: { itemDiscounts: true, currency: "PHP", paymentOptions: ["Cash", "GCash", "Card"] },
  staff: [], customers: [], closedDays: [], storageError: false, orderType: null, pagerNumber: "",
};
let state: State = initialState;
const STORAGE_KEY = "alanzalon-pos-v2";
let hydrated = false;
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  if (hydrated && typeof window !== "undefined") {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, connected: true, storageError: false })); }
    catch { state = { ...state, storageError: true }; }
  }
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function usePos<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
}

export function computeTotals(cart: CartLine[], discountOn: boolean, taxOn: boolean) {
  const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = discountOn ? subtotal * DISCOUNT_RATE : 0;
  const tax = taxOn ? (subtotal - discount) * TAX_RATE : 0;
  const total = Math.round((subtotal - discount + tax) * 100) / 100;
  return { subtotal, discount, tax, total, items: cart.reduce((s, l) => s + l.qty, 0) };
}

export const peso = (n: number, currency: Currency = state.settings.currency) => (currency === "USD" ? "$" : "₱") + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const validAdminPin = (pin: string) => /^\d{4}$/.test(pin) && pin === "1234";
export const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function salesForDate(orders: Order[], date: Date) {
  // All orders are paid at checkout; kitchen status is independent of payment completion.
  const transactions = orders.filter((o) => dayKey(new Date(o.createdAt)) === dayKey(date));
  return { transactions, count: transactions.length, gross: transactions.reduce((s, o) => s + o.subtotal, 0), net: transactions.reduce((s, o) => s + o.total, 0) };
}

export const pos = {
  hydrate() {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        if (Array.isArray(saved.products) && Array.isArray(saved.orders) && saved.store && saved.settings && Array.isArray(saved.settings.paymentOptions)) {
          set({ ...saved, orderType: isOrderType(saved.orderType) ? saved.orderType : null, pagerNumber: typeof saved.pagerNumber === "string" ? saved.pagerNumber : "", connected: true, storageError: false });
        }
      }
    } catch { set({ storageError: true }); }
  },
  updateStore: (store: StoreDetails) => set({ store }),
  updateSettings: (settings: PosSettings) => set({ settings, discountOn: settings.itemDiscounts && state.discountOn }),
  saveProduct(product: Product) {
    const products = state.products.some((p) => p.id === product.id) ? state.products.map((p) => p.id === product.id ? product : p) : [...state.products, product];
    set({ products, cart: state.cart.flatMap((l) => l.product.id !== product.id ? [l] : product.stock > 0 ? [{ ...l, product, qty: Math.min(l.qty, product.stock) }] : []) });
  },
  deleteProduct(id: string) { set({ products: state.products.filter((p) => p.id !== id), cart: state.cart.filter((l) => l.product.id !== id), held: state.held.map((h) => ({ ...h, lines: h.lines.filter((l) => l.product.id !== id) })).filter((h) => h.lines.length > 0) }); },
  addPerson(kind: "staff" | "customers", name: string, contact: string) { set({ [kind]: [...state[kind], { id: crypto.randomUUID(), name, contact }] }); },
  removePerson(kind: "staff" | "customers", id: string) { set({ [kind]: state[kind].filter((p) => p.id !== id) }); },
  closeDay(date: Date) { const key = dayKey(date); if (!state.closedDays.includes(key)) set({ closedDays: [...state.closedDays, key] }); },
  setProducts: (products: Product[]) => set({ products }),
  setConnected: (connected: boolean) => set({ connected }),
  add(product: Product) {
    const line = state.cart.find((l) => l.product.id === product.id);
    if ((line?.qty ?? 0) >= product.stock) return false;
    set({ cart: line ? state.cart.map((l) => (l === line ? { ...l, qty: l.qty + 1 } : l)) : [...state.cart, { product, qty: 1 }] });
    return true;
  },
  setQty(id: string, qty: number) {
    set({ cart: state.cart.flatMap((l) => (l.product.id !== id ? [l] : qty <= 0 ? [] : [{ ...l, qty: Math.min(qty, l.product.stock) }])) });
  },
  remove: (id: string) => set({ cart: state.cart.filter((l) => l.product.id !== id) }),
  setOrderType: (orderType: OrderType) => { if (isOrderType(orderType)) set({ orderType }); },
  setPagerNumber: (pagerNumber: string) => set({ pagerNumber }),
  setItemNote: (id: string, note: string) => set({ cart: state.cart.map((l) => l.product.id === id ? { ...l, note } : l) }),
  clear: () => set({ cart: [], discountOn: false, orderType: null, pagerNumber: "" }),
  toggleDiscount: () => { if (state.settings.itemDiscounts) set({ discountOn: !state.discountOn }); },
  toggleTax: () => set({ taxOn: !state.taxOn }),
  hold() {
    if (!state.cart.length) return;
    set({ held: [{ id: crypto.randomUUID(), lines: state.cart, at: Date.now(), orderType: state.orderType, pagerNumber: state.pagerNumber }, ...state.held], cart: [], orderType: null, pagerNumber: "" });
  },
  recall(id: string) {
    const h = state.held.find((x) => x.id === id); if (!h) return;
    set({ cart: h.lines.flatMap((l) => { const product = state.products.find((p) => p.id === l.product.id); return product && product.stock > 0 ? [{ ...l, product, qty: Math.min(l.qty, product.stock) }] : []; }), orderType: isOrderType(h.orderType) ? h.orderType : null, pagerNumber: h.pagerNumber ?? "", held: state.held.filter((x) => x.id !== id) });
  },
  checkout(method: PaymentMethod, tendered: number): Order {
    if (!isOrderType(state.orderType)) throw new Error("Select an order type before checkout.");
    const t = computeTotals(state.cart, state.discountOn, state.taxOn);
    const order: Order = {
      id: crypto.randomUUID(), number: state.nextNumber,
      lines: state.cart.map((l) => ({ name: l.product.name, qty: l.qty, price: l.product.price, ...(l.note?.trim() ? { note: l.note.trim() } : {}) })),
      orderType: state.orderType, ...(state.pagerNumber.trim() ? { pagerNumber: state.pagerNumber.trim() } : {}),
      subtotal: t.subtotal, discount: t.discount, tax: t.tax, total: t.total, method,
      tendered: method.toLowerCase() === "cash" ? tendered : t.total, change: method.toLowerCase() === "cash" ? Math.max(0, tendered - t.total) : 0,
      status: "Pending", createdAt: Date.now(), currency: state.settings.currency,
    };
    const sold = new Map(state.cart.map((l) => [l.product.id, l.qty]));
    set({
      orders: [order, ...state.orders], nextNumber: state.nextNumber + 1, cart: [], discountOn: false, orderType: null, pagerNumber: "",
      products: state.products.map((p) => ({ ...p, stock: p.stock - (sold.get(p.id) ?? 0) })),
    });
    postOrder(order).catch(() => set({ connected: false }));
    return order;
  },
  advance(id: string) {
    const flow = { Pending: "Preparing", Preparing: "Ready", Ready: "Done", Done: "Done" } as const;
    const o = state.orders.find((x) => x.id === id); if (!o) return;
    const status = flow[o.status];
    set({ orders: state.orders.map((x) => (x.id === id ? { ...x, status } : x)) });
    patchOrderStatus(id, status).catch(() => {});
  },
  restock(id: string, delta: number) {
    set({ products: state.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)) });
  },
};

import { useSyncExternalStore } from "react";
import { patchOrderStatus, postOrder } from "./pos-api";

export type Category = "Coffee" | "Non-Coffee" | "Pastries" | "Meals" | "Retail";
export interface Product { id: string; name: string; category: Category; price: number; stock: number; barcode: string; emoji: string; }
export interface CartLine { product: Product; qty: number; }
export type PaymentMethod = "Cash" | "Card" | "E-Wallet";
export interface Order {
  id: string; number: number; lines: { name: string; qty: number; price: number }[];
  subtotal: number; discount: number; tax: number; total: number;
  method: PaymentMethod; tendered: number; change: number;
  status: "Pending" | "Preparing" | "Ready" | "Done"; createdAt: number;
}
export interface HeldOrder { id: string; lines: CartLine[]; at: number; }

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
}
let state: State = { products: seedProducts, cart: [], orders: [], held: [], discountOn: false, taxOn: true, connected: true, nextNumber: 101 };
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
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

export const peso = (n: number) => "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const pos = {
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
  clear: () => set({ cart: [], discountOn: false }),
  toggleDiscount: () => set({ discountOn: !state.discountOn }),
  toggleTax: () => set({ taxOn: !state.taxOn }),
  hold() {
    if (!state.cart.length) return;
    set({ held: [{ id: crypto.randomUUID(), lines: state.cart, at: Date.now() }, ...state.held], cart: [] });
  },
  recall(id: string) {
    const h = state.held.find((x) => x.id === id); if (!h) return;
    set({ cart: h.lines, held: state.held.filter((x) => x.id !== id) });
  },
  checkout(method: PaymentMethod, tendered: number): Order {
    const t = computeTotals(state.cart, state.discountOn, state.taxOn);
    const order: Order = {
      id: crypto.randomUUID(), number: state.nextNumber,
      lines: state.cart.map((l) => ({ name: l.product.name, qty: l.qty, price: l.product.price })),
      subtotal: t.subtotal, discount: t.discount, tax: t.tax, total: t.total, method,
      tendered: method === "Cash" ? tendered : t.total, change: method === "Cash" ? Math.max(0, tendered - t.total) : 0,
      status: "Pending", createdAt: Date.now(),
    };
    const sold = new Map(state.cart.map((l) => [l.product.id, l.qty]));
    set({
      orders: [order, ...state.orders], nextNumber: state.nextNumber + 1, cart: [], discountOn: false,
      products: state.products.map((p) => (sold.has(p.id) ? { ...p, stock: p.stock - sold.get(p.id)! } : p)),
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

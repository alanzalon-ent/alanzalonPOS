import { describe, expect, it } from "vitest";
import { computeTotals, seedProducts, validAdminPin, peso, salesForDate, pos, type Order, type CartLine } from "./pos-store";

const product = seedProducts[0];
if (!product) throw new Error("Missing test product");
const cart: CartLine[] = [{ product: { ...product, price: 100 }, qty: 2 }];
describe("totals", () => {
  it("adds 12% VAT", () => expect(computeTotals(cart, false, true).total).toBe(224));
  it("applies 20% discount before VAT", () => expect(computeTotals(cart, true, true).total).toBe(179.2));
  it("no tax when off", () => expect(computeTotals(cart, false, false).total).toBe(200));
});

describe("administration and reporting", () => {
  it("requires the default four-digit PIN 1234", () => {
    expect(validAdminPin("1234")).toBe(true);
    for (const pin of ["123", "12345", "0000", "abcd", " 1234"]) expect(validAdminPin(pin)).toBe(false);
  });
  it("supports PHP and USD currency symbols", () => {
    expect(peso(120, "PHP")).toBe("₱120.00");
    expect(peso(120, "USD")).toBe("$120.00");
  });
  it("uses configured payment options for paid orders", () => {
    pos.updateSettings({ itemDiscounts: true, currency: "PHP", paymentOptions: ["Cash", "GCash", "Card"] });
    pos.clear(); pos.add(product);
    expect(pos.checkout("GCash", 0).method).toBe("GCash");
  });
  it("disabling item discounts prevents their application", () => {
    pos.clear(); pos.add(product); pos.toggleDiscount();
    pos.updateSettings({ itemDiscounts: false, currency: "PHP", paymentOptions: ["Cash", "GCash", "Card"] });
    pos.toggleDiscount();
    expect(pos.checkout("Card", 0).discount).toBe(0);
    pos.updateSettings({ itemDiscounts: true, currency: "PHP", paymentOptions: ["Cash", "GCash", "Card"] });
  });
  it("selects transactions only on the chosen calendar day", () => {
    const order: Order = { id: "paid", number: 101, lines: [{ name: "Coffee", qty: 2, price: 100 }], subtotal: 200, discount: 40, tax: 19.2, total: 179.2, method: "GCash", tendered: 179.2, change: 0, status: "Pending", createdAt: new Date(2026, 10, 18, 12).getTime(), currency: "PHP" };
    const report = salesForDate([order, { ...order, id: "yesterday", createdAt: new Date(2026, 10, 17, 23).getTime() }], new Date(2026, 10, 18));
    expect(report.count).toBe(1);
    expect(report.gross).toBe(200);
    expect(report.net).toBe(179.2);
    expect(report.transactions[0]?.number).toBe(101);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const storageKey = "alanzalon-pos-v2";
async function freshStore() {
  vi.resetModules();
  return import("./pos-store");
}

describe("device language", () => {
  beforeEach(() => localStorage.clear());

  it("remembers Arabic across refresh without changing cart metadata", async () => {
    let store = await freshStore();
    const product = store.seedProducts[0];
    if (!product) throw new Error("Missing product");
    store.pos.hydrate(); store.pos.add(product);
    store.pos.setOrderType("Take Out"); store.pos.setPagerNumber("27");
    store.pos.setItemNote(product.id, "بدون سكر");
    const before = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    store.pos.setLanguage("ar");
    store = await freshStore(); store.pos.hydrate();
    const after = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    expect(after.language).toBe("ar");
    expect(after.cart).toEqual(before.cart);
    expect(after.orderType).toBe("Take Out");
    expect(after.pagerNumber).toBe("27");
  });

  it("remembers returning to English", async () => {
    let store = await freshStore(); store.pos.hydrate();
    store.pos.setLanguage("ar"); store.pos.setLanguage("en");
    store = await freshStore(); store.pos.hydrate();
    expect(JSON.parse(localStorage.getItem(storageKey) ?? "{}").language).toBe("en");
  });

  it.each([undefined, "invalid"])("loads legacy or invalid language safely (%s)", async (language) => {
    let store = await freshStore(); store.pos.hydrate(); store.pos.setLanguage("ar");
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (language === undefined) delete saved.language;
    else saved.language = language;
    localStorage.setItem(storageKey, JSON.stringify(saved));
    store = await freshStore(); store.pos.hydrate(); store.pos.setConnected(true);
    expect(JSON.parse(localStorage.getItem(storageKey) ?? "{}").language).toBe("en");
  });

  it("keeps sale amounts, stock deduction, and stored order type identical in both languages", async () => {
    const orders = [];
    for (const language of ["en", "ar"] as const) {
      const store = await freshStore();
      const product = store.seedProducts[0];
      if (!product) throw new Error("Missing product");
      store.pos.hydrate(); store.pos.setLanguage(language);
      store.pos.add(product); store.pos.setOrderType("Delivery");
      const order = store.pos.checkout("Cash", 200);
      orders.push(order);
      expect(order.total).toBe(134.4);
      expect(order.change).toBeCloseTo(65.6);
      expect(order.orderType).toBe("Delivery");
      expect(JSON.parse(localStorage.getItem(storageKey) ?? "{}").products[0].stock).toBe(47);
      localStorage.clear();
    }
    expect(orders[0]?.subtotal).toBe(orders[1]?.subtotal);
    expect(orders[0]?.tax).toBe(orders[1]?.tax);
  });
});
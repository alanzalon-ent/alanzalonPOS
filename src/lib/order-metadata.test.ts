import { beforeEach, describe, expect, it, vi } from "vitest";

async function freshStore() {
  vi.resetModules();
  return import("./pos-store");
}

describe("order metadata", () => {
  beforeEach(() => { localStorage.clear(); });

  it("requires an explicit type for a new sale without deducting stock on rejection", async () => {
    const { pos, seedProducts } = await freshStore();
    const product = seedProducts[0];
    if (!product) throw new Error("Missing product");
    pos.hydrate(); pos.add(product);
    expect(() => pos.checkout("Card", 0)).toThrow("Select an order type");
    const saved = JSON.parse(localStorage.getItem("alanzalon-pos-v2") ?? "{}");
    expect(saved.orderType).toBeNull();
    expect(saved.products[0].stock).toBe(48);
    expect(saved.orders).toHaveLength(0);
  });

  it.each(["Dine In", "Take Out", "Delivery"] as const)("records %s without a required pager or changes to totals", async (type) => {
    const { pos, seedProducts } = await freshStore();
    const product = seedProducts[0];
    if (!product) throw new Error("Missing product");
    pos.add(product); pos.setOrderType(type);
    const order = pos.checkout("Cash", 200);
    expect(order.orderType).toBe(type);
    expect(order.pagerNumber).toBeUndefined();
    expect(order.subtotal).toBe(120);
    expect(order.tax).toBeCloseTo(14.4);
    expect(order.total).toBe(134.4);
    expect(order.change).toBeCloseTo(65.6);
  });

  it("retains pager and independent notes through hold, refresh, recall, checkout and saved-order reload", async () => {
    let store = await freshStore();
    const first = store.seedProducts[0], second = store.seedProducts[1];
    if (!first || !second) throw new Error("Missing products");
    store.pos.hydrate(); store.pos.add(first); store.pos.add(second);
    store.pos.setOrderType("Take Out"); store.pos.setPagerNumber("27");
    store.pos.setItemNote(first.id, "Less ice"); store.pos.setItemNote(second.id, "No sugar");
    store.pos.hold();
    const held = JSON.parse(localStorage.getItem("alanzalon-pos-v2") ?? "{}").held[0];
    expect(held.orderType).toBe("Take Out");
    store = await freshStore(); store.pos.hydrate(); store.pos.recall(held.id);
    store.pos.setQty(first.id, 2); store.pos.saveProduct(first);
    store = await freshStore(); store.pos.hydrate();
    const order = store.pos.checkout("Card", 0);
    expect(order.orderType).toBe("Take Out"); expect(order.pagerNumber).toBe("27");
    expect(order.lines.map((l) => l.note)).toEqual(["Less ice", "No sugar"]);
    expect(order.lines[0]?.qty).toBe(2);
    expect(order.total).toBe(436.8);
    store = await freshStore(); store.pos.hydrate();
    const saved = JSON.parse(localStorage.getItem("alanzalon-pos-v2") ?? "{}");
    expect(saved.orders[0]).toEqual(order);
    expect(saved.orderType).toBeNull(); expect(saved.pagerNumber).toBe("");
  });

  it("keeps legacy sales accessible without fabricating a type; legacy held carts require selection", async () => {
    let store = await freshStore();
    const product = store.seedProducts[0];
    if (!product) throw new Error("Missing product");
    store.pos.hydrate(); store.pos.add(product); store.pos.setOrderType("Dine In");
    const order = store.pos.checkout("Card", 0);
    const saved = JSON.parse(localStorage.getItem("alanzalon-pos-v2") ?? "{}");
    delete saved.orderType; delete saved.pagerNumber; delete saved.orders[0].orderType;
    saved.held = [{ id: "old-held", lines: [{ product, qty: 1 }], at: 1 }];
    localStorage.setItem("alanzalon-pos-v2", JSON.stringify(saved));
    store = await freshStore(); store.pos.hydrate();
    expect(store.orderTypeLabel(undefined)).toBe("Not specified");
    expect(JSON.parse(localStorage.getItem("alanzalon-pos-v2") ?? "{}").orders[0].id).toBe(order.id);
    store.pos.recall("old-held");
    expect(() => store.pos.checkout("Card", 0)).toThrow("Select an order type");
    store.pos.setOrderType("Delivery");
    expect(store.pos.checkout("Card", 0).orderType).toBe("Delivery");
  });

  it("clears order metadata on cancellation and never carries notes to a new cart", async () => {
    const { pos, seedProducts } = await freshStore();
    const product = seedProducts[0];
    if (!product) throw new Error("Missing product");
    pos.hydrate(); pos.add(product); pos.setOrderType("Delivery"); pos.setPagerNumber("8"); pos.setItemNote(product.id, "Oat milk");
    pos.clear(); pos.add(product); pos.setOrderType("Dine In");
    const order = pos.checkout("Card", 0);
    expect(order.pagerNumber).toBeUndefined(); expect(order.lines[0]?.note).toBeUndefined();
  });
});
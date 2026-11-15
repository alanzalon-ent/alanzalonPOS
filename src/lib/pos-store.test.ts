import { describe, expect, it } from "vitest";
import { computeTotals, seedProducts } from "./pos-store";

const cart = [{ product: { ...seedProducts[0], price: 100 }, qty: 2 }];
describe("totals", () => {
  it("adds 12% VAT", () => expect(computeTotals(cart, false, true).total).toBe(224));
  it("applies 20% discount before VAT", () => expect(computeTotals(cart, true, true).total).toBe(179.2));
  it("no tax when off", () => expect(computeTotals(cart, false, false).total).toBe(200));
});

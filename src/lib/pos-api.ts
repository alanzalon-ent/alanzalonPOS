// REST + Socket.io integration points. Set VITE_POS_API_URL (e.g. http://localhost:3000)
// to load from a local backend; otherwise the app runs on bundled demo data.
import type { Order, Product } from "./pos-store";

export const API_URL = (import.meta.env.VITE_POS_API_URL as string | undefined) ?? "";

export async function fetchProducts(): Promise<Product[] | null> {
  if (!API_URL) return null;
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error(`GET /api/products ${res.status}`);
  return res.json();
}

export async function postOrder(order: Order): Promise<void> {
  if (!API_URL) return;
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`POST /api/orders ${res.status}`);
}

export async function patchOrderStatus(id: string, status: Order["status"]): Promise<void> {
  if (!API_URL) return;
  await fetch(`${API_URL}/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

/* Socket.io hookup (install socket.io-client when the backend is ready):
 *   const socket = io(API_URL);
 *   socket.on("connect", () => setConnected(true));
 *   socket.on("disconnect", () => setConnected(false));
 *   socket.on("order:new", upsertOrder); socket.on("order:status", upsertOrder);
 */

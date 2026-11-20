import { orderTypeLabel, type Order } from "@/lib/pos-store";

export function OrderMetadata({ order }: { order: Pick<Order, "orderType" | "pagerNumber"> }) {
  return <div className="space-y-1 break-words text-sm text-start">
    <p className="font-semibold">Order Type: {orderTypeLabel(order.orderType)}</p>
    {order.pagerNumber?.trim() && <p className="font-semibold">Pager No.: <bdi>{order.pagerNumber}</bdi></p>}
  </div>;
}
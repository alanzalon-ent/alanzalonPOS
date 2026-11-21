import { isOrderType, type Order } from "@/lib/pos-store";
import { useT } from "@/lib/i18n";

export function OrderMetadata({ order }: { order: Pick<Order, "orderType" | "pagerNumber"> }) {
  const { t } = useT();
  return <div className="space-y-1 break-words text-sm text-start">
    <p className="font-semibold">{t("orderType")}: {isOrderType(order.orderType) ? t(order.orderType) : t("notSpecified")}</p>
    {order.pagerNumber?.trim() && <p className="font-semibold">{t("pagerNo")}: <bdi>{order.pagerNumber}</bdi></p>}
  </div>;
}
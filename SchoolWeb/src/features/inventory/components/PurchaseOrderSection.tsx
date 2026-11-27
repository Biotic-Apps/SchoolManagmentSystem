import { DetailList } from "@/components/shared/DetailList";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { orderTotal, receivedTotal } from "../purchase-amounts";
import type { PurchaseOrder } from "../types";
import type { ItemLookups } from "../use-item-lookups";
import { OrderLinesTable } from "./OrderLinesTable";

export function PurchaseOrderSection({ order, lookups }: { order: PurchaseOrder; lookups: ItemLookups }) {
  const billed = order.status === "BILLED";

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={`Purchase order ${order.poNo}`} actions={<StatusBadge status={order.status} />} />
      <DetailList
        items={[
          { label: "Vendor", value: order.vendor?.name ?? EMPTY_VALUE },
          { label: "Expected on", value: formatDate(order.expectedOn) },
          { label: "Order total", value: <MoneyText amountMinor={orderTotal(order)} /> },
          { label: "Received value", value: <MoneyText amountMinor={receivedTotal(order)} /> },
        ]}
      />
      <OrderLinesTable lines={order.lines} lookups={lookups} />
      {order.status === "ORDERED" && (
        <InlineNotice>Receive the items when they arrive; the vendor bill covers received items only.</InlineNotice>
      )}
      {billed && (
        <InlineNotice>The vendor bill is in Expenses & Vendors, where it is approved and paid.</InlineNotice>
      )}
    </section>
  );
}

import { DetailList } from "@/components/shared/DetailList";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { orderTotal } from "../purchase-amounts";
import type { PurchaseOrder } from "../types";
import type { ItemLookups } from "../use-item-lookups";
import { OrderLinesTable } from "./OrderLinesTable";

export function PurchaseOrderSection({ order, lookups }: { order: PurchaseOrder; lookups: ItemLookups }) {
  const billed = order.status === "BILLED" || !!order.expenseId;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title={`Purchase order ${order.poNo}`} actions={<StatusBadge status={order.status} />} />
      <DetailList
        items={[
          { label: "Vendor", value: order.vendor?.name ?? EMPTY_VALUE },
          { label: "Expected on", value: formatDate(order.expectedOn) },
          { label: "Order total", value: <MoneyText amountMinor={orderTotal(order)} /> },
        ]}
      />
      <OrderLinesTable lines={order.lines} lookups={lookups} />
      {billed && (
        <InlineNotice>The vendor bill is in Expenses & Vendors, where it is approved and paid.</InlineNotice>
      )}
    </section>
  );
}

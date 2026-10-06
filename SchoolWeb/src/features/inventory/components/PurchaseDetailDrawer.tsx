"use client";

import { FileText, PackageCheck, ShoppingCart } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { MoneyText } from "@/components/shared/MoneyText";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { requestTotal } from "../purchase-amounts";
import type { PurchaseRequest } from "../types";
import type { ItemLookups } from "../use-item-lookups";
import { usePurchaseDetail } from "../use-purchase-detail";
import { OrderDialog } from "./OrderDialog";
import { PurchaseOrderSection } from "./PurchaseOrderSection";
import { ReceiveDialog } from "./ReceiveDialog";
import { RequestLinesTable } from "./RequestLinesTable";

interface PurchaseDetailDrawerProps {
  request: PurchaseRequest | null;
  lookups: ItemLookups;
  onClose: () => void;
}

export function PurchaseDetailDrawer({ request, lookups, onClose }: PurchaseDetailDrawerProps) {
  const detail = usePurchaseDetail(request);
  const { order, rights } = detail;

  return (
    <DetailDrawer
      open={!!request}
      onOpenChange={(next) => {
        if (next) return;
        detail.closeDialog();
        onClose();
      }}
      title="Purchase request"
      description={
        request && (
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.status} />
            <MoneyText amountMinor={requestTotal(request)} className="font-medium text-fg" />
          </span>
        )
      }
      actions={
        request && (
          <>
            {rights.order && (
              <Button size="sm" onClick={() => detail.openDialog("order")}>
                <ShoppingCart />
                Create purchase order
              </Button>
            )}
            {rights.receive && (
              <Button size="sm" onClick={() => detail.openDialog("receive")}>
                <PackageCheck />
                Receive items
              </Button>
            )}
            {rights.bill && (
              <Button size="sm" variant="secondary" loading={detail.billing} onClick={detail.createBill}>
                <FileText />
                Create bill
              </Button>
            )}
          </>
        )
      }
    >
      {request && (
        <>
          <DetailList
            items={[
              { label: "Requested on", value: formatDate(request.createdAt) },
              { label: "Requested by", value: request.requestedBy?.name ?? EMPTY_VALUE },
              { label: "Reason", value: request.reason },
            ]}
          />
          <section className="flex flex-col gap-3">
            <SectionHeading title="Requested items" />
            <RequestLinesTable lines={request.lines} lookups={lookups} />
          </section>
          {order && <PurchaseOrderSection order={order} lookups={lookups} />}
          {detail.dialog === "order" && (
            <OrderDialog request={request} lookups={lookups} onClose={detail.closeDialog} />
          )}
          {detail.dialog === "receive" && order && (
            <ReceiveDialog order={order} lookups={lookups} onClose={detail.closeDialog} />
          )}
        </>
      )}
    </DetailDrawer>
  );
}

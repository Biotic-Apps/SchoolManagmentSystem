"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { ErrorState } from "@/components/shared/ErrorState";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateTime, formatNumber, humanize } from "@/lib/format";
import { useApproval } from "../api";
import type { ApprovalRequest } from "../types";
import { ApprovalDecisionPanel } from "./ApprovalDecisionPanel";
import { ApprovalPayloadSummary } from "./ApprovalPayloadSummary";
import { ApprovalSteps } from "./ApprovalSteps";

interface ApprovalDetailDrawerProps {
  request: ApprovalRequest | null;
  onClose: () => void;
}

export function ApprovalDetailDrawer({ request, onClose }: ApprovalDetailDrawerProps) {
  const query = useApproval(request?.id ?? null);
  const data = query.data;
  const summary = data ?? request;

  return (
    <DetailDrawer
      open={!!request}
      onOpenChange={(open) => !open && onClose()}
      title={summary?.title ?? "Request"}
      description={summary && <StatusBadge status={summary.status} />}
    >
      {summary && (
        <DetailList
          items={[
            { label: "Type", value: humanize(summary.type) },
            { label: "Requested by", value: summary.requestedBy.name },
            { label: "Created", value: formatDateTime(summary.createdAt) },
            { label: "Current step", value: formatNumber(summary.currentStep) },
            { label: "Record", value: humanize(summary.entityType) },
            ...(typeof summary.amountMinor === "number"
              ? [{ label: "Amount", value: <MoneyText amountMinor={summary.amountMinor} /> }]
              : []),
          ]}
        />
      )}
      {query.isLoading && <Skeleton className="h-40 w-full" />}
      {query.error && !data && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {data && (
        <>
          <ApprovalPayloadSummary request={data} />
          <ApprovalDecisionPanel key={data.id} request={data} />
          <ApprovalSteps request={data} />
        </>
      )}
    </DetailDrawer>
  );
}

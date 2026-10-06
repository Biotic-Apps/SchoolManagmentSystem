"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { ErrorState } from "@/components/shared/ErrorState";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { COMPLAINT_STEPS } from "../options";
import { stepFor } from "../status";
import { useComplaintDetail } from "../use-complaint-detail";
import type { OpenComplaint } from "../use-complaints-route";
import { ComplaintActions } from "./ComplaintActions";
import { ComplaintDialogs } from "./ComplaintDialogs";
import { ComplaintHeader } from "./ComplaintHeader";
import { ComplaintSummary } from "./ComplaintSummary";
import { ComplaintTimeline } from "./ComplaintTimeline";

interface ComplaintDetailDrawerProps {
  open: OpenComplaint | null;
  onClose: () => void;
}

export function ComplaintDetailDrawer({ open, onClose }: ComplaintDetailDrawerProps) {
  const detail = useComplaintDetail(open?.id ?? null, open?.box ?? "mine");
  const { complaint, query } = detail;

  return (
    <DetailDrawer
      open={!!open}
      onOpenChange={(next) => {
        if (next) return;
        detail.closeDialog();
        onClose();
      }}
      title={complaint?.subject ?? "Complaint"}
      description={complaint && <ComplaintHeader complaint={complaint} />}
      actions={complaint && <ComplaintActions rights={detail.rights} onOpen={detail.openDialog} />}
    >
      {query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && <ErrorState error={query.error} onRetry={() => query.refetch()} />}
      {complaint && (
        <>
          <StatusStepper steps={COMPLAINT_STEPS} current={stepFor(complaint)} />
          <ComplaintSummary complaint={complaint} showRegarding={detail.showRegarding} />
          <section className="flex flex-col gap-3">
            <SectionHeading title="Updates" />
            <ComplaintTimeline complaint={complaint} />
          </section>
          <ComplaintDialogs detail={detail} complaint={complaint} />
        </>
      )}
    </DetailDrawer>
  );
}

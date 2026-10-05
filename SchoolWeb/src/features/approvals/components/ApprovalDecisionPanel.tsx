"use client";

import { ApprovalActions } from "@/components/shared/ApprovalActions";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { ApprovalRequest } from "../types";
import { useApprovalDecision } from "../use-approval-decision";

export function ApprovalDecisionPanel({ request }: { request: ApprovalRequest }) {
  const decision = useApprovalDecision(request);

  if (decision.showOwnNotice) {
    return <InlineNotice tone="info">You can&apos;t decide your own request. Another approver will review it.</InlineNotice>;
  }
  if (!decision.showActions) return null;
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Your decision" />
      <ApprovalActions pending={decision.pendingDecision} onDecide={decision.decide} />
    </section>
  );
}

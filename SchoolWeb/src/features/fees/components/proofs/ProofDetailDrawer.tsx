"use client";

import { Check, X } from "lucide-react";
import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DetailList } from "@/components/shared/DetailList";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyText } from "@/components/shared/MoneyText";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EMPTY_VALUE, formatDate, formatDateTime } from "@/lib/format";
import { proofFileUrl } from "../../proof-columns";
import { proofMethodLabel } from "../../proof-options";
import type { PaymentProof } from "../../types";
import { useProofReview } from "../../use-proof-review";
import { VerifyProofDialog } from "./VerifyProofDialog";

interface ProofDetailDrawerProps {
  proof: PaymentProof | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canReview: boolean;
}

export function ProofDetailDrawer({ proof, open, onOpenChange, canReview }: ProofDetailDrawerProps) {
  const review = useProofReview(proof, () => onOpenChange(false));
  const showActions = canReview && review.pending;

  return (
    <>
      <DetailDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={proof?.student?.name ?? "Payment proof"}
        description={proof && <StatusBadge status={proof.status} />}
        actions={
          showActions && (
            <>
              <Button onClick={() => review.openDialog("verify")}>
                <Check />
                Verify
              </Button>
              <Button variant="secondary" onClick={() => review.openDialog("reject")}>
                <X />
                Reject
              </Button>
            </>
          )
        }
      >
        {proof && (
          <>
            <InlineNotice>An uploaded proof alone never marks an invoice paid. Verifying it records the payment.</InlineNotice>
            <DetailList
              items={[
                { label: "Invoice no.", value: proof.invoiceNo ?? EMPTY_VALUE },
                { label: "Amount", value: <MoneyText amountMinor={proof.amountMinor} /> },
                { label: "Paid on", value: formatDate(proof.paidOn) },
                { label: "Method", value: proofMethodLabel(proof.method) },
                { label: "Reference", value: proof.reference || EMPTY_VALUE },
                { label: "Submitted by", value: proof.submittedBy?.name ?? EMPTY_VALUE },
                { label: "Submitted", value: formatDateTime(proof.createdAt) },
                ...(proof.reason ? [{ label: "Rejection reason", value: proof.reason }] : []),
              ]}
            />
            <div>
              <DownloadButton url={proofFileUrl(proof)} label="View proof" />
            </div>
          </>
        )}
      </DetailDrawer>
      <VerifyProofDialog open={review.dialog === "verify"} onOpenChange={review.closeDialog} form={review.verifyForm} />
      <ReasonDialog
        open={review.dialog === "reject"}
        onOpenChange={review.closeDialog}
        title="Reject proof"
        description="The parent sees this reason and can upload a new proof."
        submitLabel="Reject"
        submitting={review.reject.submitting}
        error={review.reject.error}
        onSubmit={review.reject.submit}
      />
    </>
  );
}

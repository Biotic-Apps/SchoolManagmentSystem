"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import type { Certificate } from "../types";
import type { CertificateDetail } from "../use-certificate-detail";

const ISSUE_TEXT = "A PDF with a serial number and QR code is generated.";
const LEAVING_TEXT = " Issuing a school leaving certificate also withdraws the student from the school.";

interface CertificateDialogsProps {
  detail: CertificateDetail;
  certificate: Certificate;
}

export function CertificateDialogs({ detail, certificate }: CertificateDialogsProps) {
  const changeOpen = (open: boolean) => {
    if (!open) detail.closeDialog();
  };
  return (
    <>
      <ReasonDialog
        open={detail.dialog === "reject"}
        onOpenChange={changeOpen}
        title="Reject request"
        description="The requester sees this reason."
        submitLabel="Reject"
        submitting={detail.acting}
        error={detail.dialogError}
        onSubmit={detail.reject}
      />
      <ReasonDialog
        open={detail.dialog === "reissue"}
        onOpenChange={changeOpen}
        title="Reissue certificate"
        description="The duplicate keeps the same serial and is marked DUPLICATE."
        submitLabel="Reissue"
        submitting={detail.acting}
        error={detail.dialogError}
        onSubmit={detail.reissue}
      />
      <ConfirmDialog
        open={detail.dialog === "issue"}
        onOpenChange={changeOpen}
        title="Issue certificate"
        description={ISSUE_TEXT + (certificate.type === "SCHOOL_LEAVING" ? LEAVING_TEXT : "")}
        confirmLabel="Issue"
        loading={detail.acting}
        onConfirm={detail.issue}
      />
    </>
  );
}

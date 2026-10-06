"use client";

import { CircleCheck, CircleX, Copy, FileBadge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CertificateDetail } from "../use-certificate-detail";

export function CertificateActions({ detail }: { detail: CertificateDetail }) {
  const { rights } = detail;
  return (
    <>
      {rights.approve && (
        <>
          <Button size="sm" onClick={detail.approve} loading={detail.pendingAction === "approve"} disabled={detail.acting}>
            <CircleCheck />
            Approve
          </Button>
          <Button size="sm" variant="secondary" onClick={() => detail.openDialog("reject")} disabled={detail.acting}>
            <CircleX />
            Reject
          </Button>
        </>
      )}
      {rights.issue && (
        <Button size="sm" onClick={() => detail.openDialog("issue")} disabled={detail.acting}>
          <FileBadge />
          Issue
        </Button>
      )}
      {rights.reissue && (
        <Button size="sm" variant="secondary" onClick={() => detail.openDialog("reissue")} disabled={detail.acting}>
          <Copy />
          Reissue
        </Button>
      )}
    </>
  );
}

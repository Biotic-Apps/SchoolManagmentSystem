"use client";

import { DetailDrawer } from "@/components/shared/DetailDrawer";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { certificateKeys } from "../keys";
import { CERTIFICATE_STEPS, certificateTypeLabel } from "../options";
import type { Certificate } from "../types";
import { useCertificateDetail } from "../use-certificate-detail";
import { CertificateActions } from "./CertificateActions";
import { CertificateDialogs } from "./CertificateDialogs";
import { CertificateSummary } from "./CertificateSummary";
import { ClearanceBlockedNotice } from "./ClearanceBlockedNotice";

interface CertificateDetailDrawerProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export function CertificateDetailDrawer({ certificate, onClose }: CertificateDetailDrawerProps) {
  return (
    <DetailDrawer
      open={!!certificate}
      onOpenChange={(next) => !next && onClose()}
      title={certificate ? `${certificateTypeLabel(certificate.type)} certificate` : "Certificate"}
    >
      {certificate && <CertificateDetail key={certificate.id} certificate={certificate} />}
    </DetailDrawer>
  );
}

function CertificateDetail({ certificate }: { certificate: Certificate }) {
  const detail = useCertificateDetail(certificate);
  const rejected = certificate.status === "REJECTED";

  return (
    <>
      <StatusStepper
        steps={CERTIFICATE_STEPS}
        current={rejected ? "APPROVED" : certificate.status}
        failedLabel={rejected ? "Rejected" : null}
      />
      <div className="flex flex-wrap gap-2">
        <CertificateActions detail={detail} />
        {certificate.status === "ISSUED" && <DownloadButton url={certificate.fileUrl} label="Download PDF" size="sm" />}
      </div>
      {detail.clearance && <ClearanceBlockedNotice clearance={detail.clearance} />}
      <JobProgressNotice
        jobId={detail.jobId}
        label="Generating the certificate PDF"
        doneLabel="The certificate PDF is ready."
        invalidate={[certificateKeys.all]}
      />
      <CertificateSummary certificate={certificate} />
      <CertificateDialogs detail={detail} certificate={certificate} />
    </>
  );
}

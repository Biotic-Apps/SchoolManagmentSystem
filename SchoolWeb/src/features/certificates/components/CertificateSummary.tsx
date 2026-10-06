import { DetailList, type DetailItem } from "@/components/shared/DetailList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatDate, textOrDash } from "@/lib/format";
import { isDuplicate, issuedOn, requestedOn, serialOf, studentNameOf } from "../fields";
import { certificateTypeLabel } from "../options";
import type { Certificate } from "../types";

function summaryItems(certificate: Certificate): DetailItem[] {
  const student = certificate.student;
  const classLabel = [student?.className, student?.sectionName].filter(Boolean).join(" ");
  const rejection = certificate.rejectionReason ?? certificate.reason;
  const items: (DetailItem | false)[] = [
    {
      label: "Serial",
      value: (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="tabular-nums">{serialOf(certificate)}</span>
          {isDuplicate(certificate) && <Badge tone="warning">Duplicate</Badge>}
        </span>
      ),
    },
    { label: "Student", value: studentNameOf(certificate) },
    !!classLabel && { label: "Class", value: classLabel },
    { label: "Type", value: certificateTypeLabel(certificate.type) },
    { label: "Status", value: <StatusBadge status={certificate.status} /> },
    { label: "Purpose", value: textOrDash(certificate.purpose) },
    !!certificate.details?.achievement && { label: "Achievement", value: certificate.details.achievement },
    !!certificate.requestedBy && { label: "Requested by", value: certificate.requestedBy.name },
    { label: "Requested", value: formatDate(requestedOn(certificate)) },
    { label: "Issued", value: formatDate(issuedOn(certificate)) },
    certificate.status === "REJECTED" && !!rejection && { label: "Reason", value: rejection },
  ];
  return items.filter((item): item is DetailItem => !!item);
}

export function CertificateSummary({ certificate }: { certificate: Certificate }) {
  return <DetailList items={summaryItems(certificate)} />;
}

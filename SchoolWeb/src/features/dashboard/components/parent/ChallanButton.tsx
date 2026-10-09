"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { Button } from "@/components/ui/Button";
import { useInvoicePdf } from "@/features/fees/invoices-api";
import { useJobPoll } from "@/lib/use-job-poll";

/** "Download challan": asks for the PDF, waits for the background job, then offers the file. */
export function ChallanButton({ invoiceId }: { invoiceId: string }) {
  const pdf = useInvoicePdf();
  const [direct, setDirect] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const job = useJobPoll(jobId);
  const url = direct ?? (job.completed ? (job.job?.result?.fileUrl ?? null) : null);

  if (url) return <DownloadButton url={url} label="Download challan" size="sm" variant="primary" />;
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pdf.isPending || job.running}
      onClick={() =>
        pdf.mutate(invoiceId, {
          onSuccess: (data) => {
            const ready = data?.fileUrl ?? data?.url ?? null;
            setDirect(ready);
            setJobId(ready ? null : (data?.jobId ?? null));
          },
        })
      }
    >
      <FileDown />
      {job.running ? "Preparing challan…" : job.failed ? "Try again" : "Download challan"}
    </Button>
  );
}

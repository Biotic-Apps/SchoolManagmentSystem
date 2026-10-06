"use client";

import { FileDown } from "lucide-react";
import { DownloadButton } from "@/components/shared/DownloadButton";
import { JobProgressNotice } from "@/components/shared/JobProgressNotice";
import { Button } from "@/components/ui/Button";
import { useInvoiceChallan } from "../../use-invoice-challan";

export function InvoiceChallan({ invoiceId }: { invoiceId: string }) {
  const challan = useInvoiceChallan(invoiceId);

  if (challan.url) return <DownloadButton url={challan.url} label="Download challan" />;

  return (
    <div className="flex flex-col gap-3">
      <JobProgressNotice
        jobId={challan.jobId}
        label="Preparing the challan"
        doneLabel="The challan is ready. Select Get challan to download it."
      />
      <Button
        variant="secondary"
        className="self-start"
        loading={challan.requesting}
        disabled={challan.preparing}
        onClick={challan.request}
      >
        <FileDown />
        Get challan
      </Button>
    </div>
  );
}

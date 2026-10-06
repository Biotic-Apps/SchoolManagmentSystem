import { useState } from "react";
import { useJobPoll } from "@/lib/use-job-poll";
import { useInvoicePdf, type InvoicePdfResult } from "./invoices-api";

/** Challan PDF: the API answers with a file url, or a job to wait for before asking again. */
export function useInvoiceChallan(invoiceId: string) {
  const pdf = useInvoicePdf();
  const [result, setResult] = useState<InvoicePdfResult | null>(null);
  const url = result?.fileUrl ?? result?.url ?? null;
  const jobId = url ? null : (result?.jobId ?? null);
  const job = useJobPoll(jobId);

  return {
    url,
    jobId,
    requesting: pdf.isPending,
    preparing: job.running,
    request: () => pdf.mutate(invoiceId, { onSuccess: (data) => setResult(data ?? null) }),
  };
}

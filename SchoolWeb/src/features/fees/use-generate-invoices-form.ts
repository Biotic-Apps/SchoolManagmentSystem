import { useServerForm } from "@/lib/use-server-form";
import { useGenerateInvoices } from "./invoices-api";
import {
  generateInvoicesDefaults,
  generateInvoicesSchema,
  toGenerateInvoicesInput,
  type GenerateInvoicesValues,
} from "./invoice-schemas";

interface GenerateContext {
  branchId: string;
  sessionId: string | null;
  period: string;
}

export function useGenerateInvoicesForm(
  { branchId, sessionId, period }: GenerateContext,
  onStarted: (result: { jobId?: string | null } | null) => void,
) {
  const generate = useGenerateInvoices();
  return useServerForm<GenerateInvoicesValues, { jobId?: string | null } | null>({
    schema: generateInvoicesSchema,
    defaultValues: generateInvoicesDefaults(sessionId, period),
    onSubmit: (values) => generate.mutateAsync(toGenerateInvoicesInput(values, branchId)),
    onSuccess: onStarted,
  });
}

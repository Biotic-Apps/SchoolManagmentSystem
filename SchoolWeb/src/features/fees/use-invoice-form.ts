import { useServerForm } from "@/lib/use-server-form";
import { useCreateInvoice } from "./invoices-api";
import { adHocInvoiceDefaults, adHocInvoiceSchema, toAdHocInvoiceInput, type AdHocInvoiceValues } from "./invoice-schemas";
import type { Invoice } from "./types";

/** Ad-hoc DRAFT invoice for one student. */
export function useInvoiceForm(onCreated: (invoice: Invoice) => void) {
  const create = useCreateInvoice();
  return useServerForm<AdHocInvoiceValues, Invoice>({
    schema: adHocInvoiceSchema,
    defaultValues: adHocInvoiceDefaults(),
    onSubmit: (values) => create.mutateAsync(toAdHocInvoiceInput(values)),
    onSuccess: onCreated,
  });
}

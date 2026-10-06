import { useState } from "react";
import type { Option } from "@/components/shared/OptionSelect";
import { ApiError } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { useServerForm } from "@/lib/use-server-form";
import { toProofInput, uploadProofDefaults, uploadProofSchema, type UploadProofValues } from "./proof-schemas";
import { useSubmitProof } from "./proofs-api";
import type { Invoice } from "./types";

/** 403 or a "...DISABLED" code means the school has proof upload switched off. */
function isUploadOff(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.code.endsWith("DISABLED"));
}

/** Parent uploads a bank / wallet payment proof for one open invoice. */
export function useParentFeesProofForm(invoices: Invoice[], invoiceId: string | undefined, onDone: () => void) {
  const [uploadOff, setUploadOff] = useState(false);
  const submitProof = useSubmitProof();

  const { form, submit, submitting, formError } = useServerForm<UploadProofValues, boolean>({
    schema: uploadProofSchema,
    defaultValues: uploadProofDefaults(invoiceId),
    onSubmit: async (values) => {
      try {
        await submitProof.mutateAsync(toProofInput(values));
        return true;
      } catch (error) {
        if (!isUploadOff(error)) throw error;
        setUploadOff(true);
        return false;
      }
    },
    onSuccess: (done) => done && onDone(),
  });

  const invoiceOptions: Option[] = invoices
    .filter((invoice) => invoice.balanceMinor > 0)
    .map((invoice) => ({
      id: invoice.id,
      name: `${invoice.invoiceNo} · due ${formatDate(invoice.dueDate)}`,
    }));

  return { form, submit, submitting, formError, uploadOff, invoiceOptions };
}

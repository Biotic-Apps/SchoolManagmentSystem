import { z } from "zod";
import { todayIso } from "@/lib/dates";
import { moneyText, toMinor } from "@/lib/money";
import { blankToUndefined, isoDate, optionalIsoDate, optionalText, requiredText } from "@/lib/validation";
import type { ProofInput } from "./proofs-api";
import type { ProofMethod } from "./types";

export const verifyProofSchema = z.object({
  receivedOn: optionalIsoDate,
  note: optionalText(500),
});
export type VerifyProofValues = z.infer<typeof verifyProofSchema>;

export const verifyProofDefaults: VerifyProofValues = { receivedOn: "", note: "" };

export function toVerifyInput(values: VerifyProofValues) {
  return { receivedOn: blankToUndefined(values.receivedOn), note: blankToUndefined(values.note) };
}

export const uploadProofSchema = z.object({
  invoiceId: z.string().min(1, "Choose the invoice you paid"),
  amount: moneyText("the amount paid"),
  paidOn: isoDate.refine((value) => value <= todayIso(), "The date can't be in the future"),
  method: z.string().min(1, "Choose how you paid"),
  reference: requiredText("the transaction reference", 80),
  fileId: z.string().min(1, "Attach the receipt or screenshot"),
});
export type UploadProofValues = z.infer<typeof uploadProofSchema>;

export const uploadProofDefaults = (invoiceId?: string): UploadProofValues => ({
  invoiceId: invoiceId ?? "",
  amount: "",
  paidOn: todayIso(),
  method: "BANK",
  reference: "",
  fileId: "",
});

export function toProofInput(values: UploadProofValues): ProofInput {
  return {
    invoiceId: values.invoiceId,
    amountMinor: toMinor(values.amount) ?? 0,
    paidOn: values.paidOn,
    method: values.method as ProofMethod,
    reference: values.reference.trim(),
    fileId: values.fileId,
  };
}

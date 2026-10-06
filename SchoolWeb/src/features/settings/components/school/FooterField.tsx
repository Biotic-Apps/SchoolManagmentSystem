"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { FOOTER_MAX } from "../../school-schemas";

interface FooterFieldProps {
  name: "receiptFooter" | "reportCardFooter";
  label: string;
  hint: string;
}

/** Footer textarea with a character counter in the hint. */
export function FooterField({ name, label, hint }: FooterFieldProps) {
  const { control } = useFormContext();
  const value: string = useWatch({ control, name }) ?? "";
  return <TextareaField name={name} label={label} rows={3} hint={`${hint} ${value.length} / ${FOOTER_MAX} characters.`} />;
}

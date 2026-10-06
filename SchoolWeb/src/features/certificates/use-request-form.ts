import { useWatch } from "react-hook-form";
import { useActiveChild, useIsParent } from "@/features/auth/use-active-child";
import { useServerForm } from "@/lib/use-server-form";
import { useRequestCertificate } from "./api";
import { CLEARANCE_TYPES } from "./options";
import { requestDefaults, requestSchema, toCertificateInput } from "./schemas";
import type { Certificate, CertificateType } from "./types";

export function useRequestForm(onSaved: (certificate: Certificate) => void) {
  const isParent = useIsParent();
  const child = useActiveChild();
  const create = useRequestCertificate();

  const { form, submit, submitting, formError } = useServerForm({
    schema: requestSchema,
    defaultValues: requestDefaults(isParent ? child?.id : null),
    onSubmit: (values) => create.mutateAsync(toCertificateInput(values)),
    onSuccess: onSaved,
  });
  const type = useWatch({ control: form.control, name: "type" }) as CertificateType | "";

  return {
    form,
    submit,
    submitting,
    formError,
    isParent,
    childName: child?.name ?? null,
    showAchievement: type === "ACHIEVEMENT",
    needsClearance: !!type && CLEARANCE_TYPES.includes(type),
  };
}

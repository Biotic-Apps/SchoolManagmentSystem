import { useServerForm } from "@/lib/use-server-form";
import { useSaveEnquiry } from "./api";
import { enquiryUpdateDefaults, enquiryUpdateSchema, toEnquiryUpdate, type EnquiryUpdateValues } from "./schemas";
import type { Enquiry } from "./types";

export function useEnquiryUpdateForm(item: Enquiry, onDone: () => void) {
  const save = useSaveEnquiry();
  return useServerForm<EnquiryUpdateValues>({
    schema: enquiryUpdateSchema,
    defaultValues: enquiryUpdateDefaults(item),
    onSubmit: (values) => save.mutateAsync({ id: item.id, input: toEnquiryUpdate(values, item) }),
    onSuccess: onDone,
  });
}

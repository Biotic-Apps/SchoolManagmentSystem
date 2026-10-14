import { useServerForm } from "@/lib/use-server-form";
import { useConvertEnquiry } from "./api";
import { convertEnquiryDefaults, convertEnquirySchema, toConvertEnquiryInput, type ConvertEnquiryValues } from "./schemas";
import type { Application, Enquiry } from "./types";

export function useConvertEnquiryForm(item: Enquiry, onDone: (application: Application) => void) {
  const convert = useConvertEnquiry();
  return useServerForm<ConvertEnquiryValues, Application>({
    schema: convertEnquirySchema(!item.dob),
    defaultValues: convertEnquiryDefaults(item),
    onSubmit: (values) => convert.mutateAsync({ id: item.id, input: toConvertEnquiryInput(values) }),
    onSuccess: onDone,
  });
}

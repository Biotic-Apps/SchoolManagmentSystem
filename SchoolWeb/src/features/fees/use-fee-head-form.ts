import { useServerForm } from "@/lib/use-server-form";
import { useCreateFeeHead } from "./structure-api";
import { FEE_HEAD_DEFAULTS, feeHeadSchema, toFeeHeadInput, type FeeHeadFormValues } from "./structure-schemas";

export function useFeeHeadForm(schoolId: string | null, onDone: () => void) {
  const create = useCreateFeeHead();
  return useServerForm<FeeHeadFormValues>({
    schema: feeHeadSchema,
    defaultValues: FEE_HEAD_DEFAULTS,
    conflictField: "code",
    onSubmit: async (values) => {
      if (!schoolId) throw new Error("Choose a branch first");
      return create.mutateAsync(toFeeHeadInput(values, schoolId));
    },
    onSuccess: onDone,
  });
}

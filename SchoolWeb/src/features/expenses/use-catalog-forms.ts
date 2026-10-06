import { useServerForm } from "@/lib/use-server-form";
import { useCreateExpenseCategory } from "./categories-api";
import { categoryDefaults, categorySchema, toCategoryInput, toVendorInput, vendorDefaults, vendorSchema } from "./catalog-schemas";
import { useCreateVendor } from "./vendors-api";

export function useVendorForm(onDone: () => void) {
  const create = useCreateVendor();
  return useServerForm({
    schema: vendorSchema,
    defaultValues: vendorDefaults,
    onSubmit: (values) => create.mutateAsync(toVendorInput(values)),
    onSuccess: onDone,
    conflictField: "name",
  });
}

export function useCategoryForm(schoolId: string | null, onDone: () => void) {
  const create = useCreateExpenseCategory(schoolId);
  return useServerForm({
    schema: categorySchema,
    defaultValues: categoryDefaults,
    onSubmit: (values) => create.mutateAsync(toCategoryInput(values)),
    onSuccess: onDone,
    conflictField: "code",
  });
}

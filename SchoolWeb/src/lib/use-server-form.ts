import { useState } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { applyServerErrors } from "./form-errors";

interface ServerFormOptions<T extends FieldValues, R> {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (values: T) => Promise<R>;
  onSuccess?: (result: R, values: T) => void;
  /** Field that receives a CONFLICT message inline (e.g. a unique code). */
  conflictField?: Path<T>;
}

/** react-hook-form + zod, with API VALIDATION_FAILED/CONFLICT errors mapped onto fields. */
export function useServerForm<T extends FieldValues, R = unknown>({
  schema,
  defaultValues,
  onSubmit,
  onSuccess,
  conflictField,
}: ServerFormOptions<T, R>) {
  const form = useForm<T>({ resolver: zodResolver(schema) as unknown as Resolver<T>, defaultValues });
  const [formError, setFormError] = useState<string | null>(null);

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await onSubmit(values);
      onSuccess?.(result, values);
    } catch (error) {
      setFormError(applyServerErrors(error, form.setError, Object.keys(values), conflictField));
    }
  });

  return { form, submit, submitting: form.formState.isSubmitting, formError };
}

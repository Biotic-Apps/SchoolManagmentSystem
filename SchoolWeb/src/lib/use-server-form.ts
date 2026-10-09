import { useRef, useState, type BaseSyntheticEvent } from "react";
import { useForm, type DefaultValues, type FieldValues, type Path, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { focusFirstInvalid, formOf } from "./form-focus";
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
  // Set synchronously, so a double click or Enter pressed again before the re-render is ignored.
  const inFlight = useRef(false);

  const submit = (event?: BaseSyntheticEvent) => {
    if (inFlight.current) {
      event?.preventDefault?.();
      return Promise.resolve();
    }
    inFlight.current = true;
    const formElement = formOf(event);
    return form
      .handleSubmit(
        async (values) => {
          setFormError(null);
          try {
            const result = await onSubmit(values);
            // Success is only reported once the server has confirmed the save.
            onSuccess?.(result, values);
          } catch (error) {
            setFormError(applyServerErrors(error, form.setError, Object.keys(values), conflictField));
            focusFirstInvalid(formElement);
          }
        },
        () => focusFirstInvalid(formElement),
      )(event)
      .finally(() => {
        inFlight.current = false;
      });
  };

  return { form, submit, submitting: form.formState.isSubmitting, formError };
}

import { useFieldArray, useWatch } from "react-hook-form";
import { ApiError } from "@/lib/api-error";
import { errorMessage } from "@/lib/error-messages";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { checkBandCoverage } from "./grade-bands";
import { useSaveGradingScheme } from "./grading-api";
import { emptyBand, gradingSchemeDefaults, gradingSchemeSchema, toGradingSchemeInput, type GradingSchemeValues } from "./grading-schemas";
import type { GradingScheme } from "./types";

interface GradingFormOptions {
  scheme: GradingScheme | null;
  schoolId: string;
  sessionId: string;
  onDone: () => void;
  /** The API refused the change (409): an exam using the scheme has approved results. */
  onLocked: (id: string) => void;
}

export function useGradingForm({ scheme, schoolId, sessionId, onDone, onLocked }: GradingFormOptions) {
  const save = useSaveGradingScheme();
  const server = useServerForm<GradingSchemeValues, unknown>({
    schema: gradingSchemeSchema,
    defaultValues: gradingSchemeDefaults(scheme),
    onSubmit: async (values) => {
      try {
        return await save.mutateAsync({ id: scheme?.id, input: toGradingSchemeInput(values, { schoolId, sessionId }) });
      } catch (error) {
        if (scheme && error instanceof ApiError && error.status === 409) {
          toast.error(errorMessage(error));
          onLocked(scheme.id);
          onDone();
          return null;
        }
        throw error;
      }
    },
    onSuccess: onDone,
  });

  const { control, formState } = server.form;
  const bands = useFieldArray({ control, name: "bands" });
  const values = useWatch({ control, name: "bands" });
  const coverage = checkBandCoverage(values ?? []);

  return {
    ...server,
    rows: bands.fields,
    addBand: () => bands.append({ ...emptyBand }),
    removeBand: (index: number) => bands.remove(index),
    // Coverage problems show once the user has tried to save.
    coverage: formState.isSubmitted ? coverage : { rows: {}, general: null },
  };
}

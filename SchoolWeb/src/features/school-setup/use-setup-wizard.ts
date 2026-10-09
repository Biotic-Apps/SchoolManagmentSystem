import { useState, type FormEvent } from "react";
import { useForm, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { useSetupSchool } from "./api";
import { setupFormDefaults } from "./form-defaults";
import { setupSchema, type SetupFormValues } from "./schemas";
import { applySetupErrors } from "./setup-errors";
import { SETUP_STEPS, stepForField } from "./steps";
import { toLegacySetupInput, toSetupInput } from "./to-setup-input";
import { validationIssues } from "@/lib/form-errors";
import type { SchoolSetupResult } from "./types";

const REVIEW = SETUP_STEPS.length - 1;

/** "academics.classes" etc. from a nested errors object (one level into groups). */
function errorPaths(errors: object): string[] {
  return Object.entries(errors).flatMap(([group, value]) =>
    value && typeof value === "object" && !("message" in value) ? Object.keys(value).map((key) => `${group}.${key}`) : [group],
  );
}

/** One form across the steps: Next validates the step, Back keeps values, server errors jump to their step. */
export function useSetupWizard() {
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema) as unknown as Resolver<SetupFormValues>,
    defaultValues: setupFormDefaults(),
    mode: "onTouched",
  });
  const setup = useSetupSchool();
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<SchoolSetupResult | null>(null);

  useReportUnsaved(form.formState.isDirty && !result);

  const show = (index: number) => {
    setStep(index);
    setReached((value) => Math.max(value, index));
  };

  /** Validates steps from..to-1; stops on the first one with errors. */
  const validateUpTo = async (target: number): Promise<number> => {
    for (let index = step; index < target; index += 1) {
      const fields = SETUP_STEPS[index].fields as FieldPath<SetupFormValues>[];
      if (fields.length && !(await form.trigger(fields, { shouldFocus: index === step }))) return index;
    }
    return target;
  };

  const goTo = async (index: number) => {
    setFormError(null);
    if (index <= step) return setStep(index);
    show(await validateUpTo(index));
  };

  // An API without per-class setup rejects the new fields; send the older shape instead.
  const submitWithFallback = async (values: SetupFormValues) => {
    try {
      return await setup.mutateAsync(toSetupInput(values));
    } catch (error) {
      if (!validationIssues(error).some((issue) => /should not exist/i.test(issue.message))) throw error;
      return setup.mutateAsync(toLegacySetupInput(values));
    }
  };

  const create = async (values: SetupFormValues) => {
    setFormError(null);
    try {
      setResult(await submitWithFallback(values));
    } catch (error) {
      const outcome = applySetupErrors(error, form.setError);
      if (outcome.step !== null && outcome.step >= 0) setStep(outcome.step);
      setFormError(outcome.message);
    }
  };

  // Enter on any field moves on; on the review step it creates the school.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (setup.isPending) return;
    if (step < REVIEW) return void goTo(step + 1);
    void form.handleSubmit(create, (errors) => {
      const steps = errorPaths(errors).map(stepForField).filter((index) => index >= 0);
      setStep(steps.length ? Math.min(...steps) : 0);
    })();
  };

  return {
    form,
    step,
    reached,
    isReview: step === REVIEW,
    current: SETUP_STEPS[step],
    goTo: (index: number) => void goTo(index),
    back: () => setStep((value) => Math.max(0, value - 1)),
    onSubmit,
    submitting: setup.isPending,
    formError,
    result,
  };
}

export type SetupWizardState = ReturnType<typeof useSetupWizard>;

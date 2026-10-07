import { useState, type FormEvent } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReportUnsaved } from "@/components/shared/UnsavedChangesGuard";
import { useSetupSchool } from "./api";
import { setupFormDefaults } from "./form-defaults";
import { setupSchema, type SetupFormValues } from "./schemas";
import { applySetupErrors } from "./setup-errors";
import { SETUP_STEPS, stepForField } from "./steps";
import { toSetupInput } from "./to-setup-input";
import type { SchoolSetupResult } from "./types";

const REVIEW = SETUP_STEPS.length - 1;

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
      const groups = SETUP_STEPS[index].groups;
      if (groups.length && !(await form.trigger(groups, { shouldFocus: index === step }))) return index;
    }
    return target;
  };

  const goTo = async (index: number) => {
    setFormError(null);
    if (index <= step) return setStep(index);
    show(await validateUpTo(index));
  };

  const create = async (values: SetupFormValues) => {
    setFormError(null);
    try {
      setResult(await setup.mutateAsync(toSetupInput(values)));
    } catch (error) {
      const outcome = applySetupErrors(error, form.setError);
      if (outcome.step !== null && outcome.step >= 0) setStep(outcome.step);
      setFormError(outcome.message);
    }
  };

  // Enter on any field moves on; on the review step it creates the school.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < REVIEW) return void goTo(step + 1);
    void form.handleSubmit(create, (errors) => {
      const steps = Object.keys(errors).map(stepForField).filter((index) => index >= 0);
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

"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { focusFirstField } from "@/components/shared/FormDialog";
import { Stepper } from "@/components/shared/Stepper";
import { useGuardedAction } from "@/components/shared/UnsavedChangesGuard";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/Dialog";
import { SETUP_STEPS } from "../steps";
import { useSetupWizard } from "../use-setup-wizard";
import { useStepFocus } from "../use-step-focus";
import { SetupSuccess, SetupSuccessFooter } from "./SetupSuccess";
import { StepBody } from "./StepBody";
import { WizardFooter } from "./WizardFooter";

// Wide dialog on desktop, full-screen sheet on phones; header and footer stay put, the body scrolls.
const SHELL =
  "max-w-[920px] max-h-[calc(100dvh-48px)] gap-0 overflow-hidden p-0 sm:p-0 " +
  "max-sm:left-0 max-sm:top-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-screen max-sm:max-w-none " +
  "max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0";
const PAD = "px-4 sm:px-8";

export function SetupWizard({ onClose }: { onClose: () => void }) {
  const wizard = useSetupWizard();
  const guard = useGuardedAction();
  const bodyRef = useStepFocus<HTMLDivElement>(wizard.result ? "done" : wizard.step);
  const close = () => (wizard.result ? onClose() : guard(onClose));
  const { current, result } = wizard;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className={SHELL} onOpenAutoFocus={focusFirstField}>
        <header className={`flex shrink-0 flex-col gap-4 border-b border-border pb-4 pt-6 ${PAD}`}>
          <div className="flex flex-col gap-1 pr-8">
            <DialogTitle>{result ? "School created" : "New school"}</DialogTitle>
            <DialogDescription className={result ? undefined : "max-sm:sr-only"}>
              {result
                ? "Share the sign-in details below with the principal."
                : "Set up the school, its main branch, the principal and the academic year in one go."}
            </DialogDescription>
          </div>
          {!result && (
            <Stepper steps={SETUP_STEPS} current={wizard.step} reachable={wizard.reached} onStepClick={wizard.goTo} />
          )}
        </header>
        {result ? (
          <>
            <div ref={bodyRef} className={`min-h-0 flex-1 overflow-y-auto py-6 ${PAD}`}>
              <SetupSuccess result={result} />
            </div>
            <SetupSuccessFooter branchId={result.branch.id} onDone={onClose} className={PAD} />
          </>
        ) : (
          <FormProvider {...wizard.form}>
            <form onSubmit={wizard.onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div ref={bodyRef} className={`flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-6 ${PAD}`}>
                <div className="flex flex-col gap-1">
                  <h3 className="text-card-title font-semibold text-fg">{current.title}</h3>
                  <p className="text-label text-fg-muted">{current.helper}</p>
                </div>
                <FormAlert message={wizard.formError} />
                <StepBody step={current.id} onEdit={wizard.goTo} />
              </div>
              <WizardFooter
                step={wizard.step}
                total={SETUP_STEPS.length}
                last={wizard.isReview}
                submitting={wizard.submitting}
                onBack={wizard.back}
                onCancel={close}
                className={PAD}
              />
            </form>
          </FormProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

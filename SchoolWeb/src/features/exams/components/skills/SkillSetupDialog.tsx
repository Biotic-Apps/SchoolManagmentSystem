"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Skeleton } from "@/components/ui/Skeleton";
import { SKILL_DOMAINS } from "../../skill-types";
import { useSkillSetupForm } from "../../use-skill-setup-form";
import { SkillDomainEditor } from "./SkillDomainEditor";
import { SkillScaleEditor } from "./SkillScaleEditor";

/** Branch items (affective, psychomotor) and the rating scale used on every report card. */
export function SkillSetupDialog({ branchId, onClose }: { branchId: string; onClose: () => void }) {
  const form = useSkillSetupForm(branchId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Behaviour & skills"
      description="Items teachers rate each term, and the scale printed on the report card. Removed items keep past ratings."
      submitLabel="Save setup"
      submitting={form.saving}
      submitDisabled={form.problems.length > 0}
      onSubmit={form.submit}
      error={form.error}
      size="xl"
    >
      {form.loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {SKILL_DOMAINS.map((domain) => (
            <SkillDomainEditor key={domain.id} domain={domain.id} title={domain.name} form={form} />
          ))}
          <div className="md:col-span-2 md:max-w-lg">
            <SkillScaleEditor form={form} />
          </div>
        </div>
      )}
      {form.problems.length > 0 && <InlineNotice tone="warning">{form.problems[0]}</InlineNotice>}
    </FormDialog>
  );
}

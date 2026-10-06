"use client";

import { FormProvider } from "react-hook-form";
import { FormAlert } from "@/components/shared/FormAlert";
import { Card, CardContent } from "@/components/ui/Card";
import type { PolicySettings } from "../../types";
import { usePolicySettingsForm } from "../../use-policy-settings-form";
import { ReadOnlyNotice } from "../ReadOnlyNotice";
import { SettingsFormActions } from "../SettingsFormActions";
import { DefaultsPolicySection } from "./DefaultsPolicySection";
import { SecurityPolicySection } from "./SecurityPolicySection";

interface PolicySettingsFormProps {
  schoolId: string;
  settings: PolicySettings;
  canEdit: boolean;
}

export function PolicySettingsForm({ schoolId, settings, canEdit }: PolicySettingsFormProps) {
  const { form, submit, submitting, formError, dirty, discard } = usePolicySettingsForm(schoolId, settings);

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate>
        <Card>
          <CardContent className="flex flex-col gap-6">
            {!canEdit && <ReadOnlyNotice />}
            <FormAlert message={formError} />
            <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6">
              <SecurityPolicySection />
              <DefaultsPolicySection />
            </fieldset>
            {canEdit && <SettingsFormActions dirty={dirty} submitting={submitting} onDiscard={discard} />}
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}

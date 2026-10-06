"use client";

import { FormProvider } from "react-hook-form";
import { DetailList } from "@/components/shared/DetailList";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { TextField } from "@/components/shared/form/TextField";
import { Card, CardContent } from "@/components/ui/Card";
import type { SchoolSettings } from "../../types";
import { useSchoolSettingsForm } from "../../use-school-settings-form";
import { ReadOnlyNotice } from "../ReadOnlyNotice";
import { SettingsFormActions } from "../SettingsFormActions";
import { BrandPreview } from "./BrandPreview";
import { FooterField } from "./FooterField";
import { PrimaryColorField } from "./PrimaryColorField";
import { SchoolLogoSetting } from "./SchoolLogoSetting";

interface SchoolSettingsFormProps {
  schoolId: string;
  settings: SchoolSettings;
  canEdit: boolean;
}

export function SchoolSettingsForm({ schoolId, settings, canEdit }: SchoolSettingsFormProps) {
  const school = useSchoolSettingsForm(schoolId, settings);

  return (
    <FormProvider {...school.form}>
      <form onSubmit={school.submit} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardContent className="flex flex-col gap-6">
            {!canEdit && <ReadOnlyNotice />}
            <FormAlert message={school.formError} />
            <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6">
              <FormSection title="Identity" description="Shown on the login screen, the top bar, receipts and report cards.">
                <SchoolLogoSetting logo={school.logo} />
                <TextField name="displayName" label="Display name" required maxLength={120} />
              </FormSection>
              <FormSection title="Brand colour" description="Used for buttons and highlights on the login screen and top bar.">
                <PrimaryColorField color={school.color} />
              </FormSection>
              <FormSection title="Printed footers">
                <FooterField name="receiptFooter" label="Receipt footer" hint="Printed at the bottom of fee receipts." />
                <FooterField name="reportCardFooter" label="Report card footer" hint="Printed at the bottom of report cards." />
              </FormSection>
            </fieldset>
            <FormSection title="Regional" description="These are fixed for the school.">
              <DetailList
                items={[
                  { label: "Time zone", value: settings.timezone },
                  { label: "Currency", value: settings.currency },
                  { label: "Locale", value: settings.locale },
                ]}
              />
            </FormSection>
            {canEdit && (
              <SettingsFormActions
                dirty={school.dirty}
                submitting={school.submitting}
                onDiscard={school.discard}
                blocked={!school.color.passes}
              />
            )}
          </CardContent>
        </Card>
        <BrandPreview
          color={school.color.value}
          passes={school.color.passes}
          name={school.displayName?.trim() || settings.displayName}
          logoUrl={school.logo.previewUrl}
          className="lg:sticky lg:top-6"
        />
      </form>
    </FormProvider>
  );
}

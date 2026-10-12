"use client";

import { useCallback } from "react";
import { FormProvider } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/shared/FormAlert";
import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { useServerForm } from "@/lib/use-server-form";
import { useSaveReportCardTemplate } from "../templates-api";
import {
  templateSchema,
  templateDefaults,
  templateToValues,
  valuesToInput,
  type TemplateFormValues,
} from "../template-schema";
import type { ReportCardTemplate } from "../types";

interface TemplateFormProps {
  template?: ReportCardTemplate | null;
  onClose: () => void;
}

const ORIENTATION_OPTIONS = [
  { id: "portrait", name: "Portrait" },
  { id: "landscape", name: "Landscape" },
];

const PAPER_SIZE_OPTIONS = [
  { id: "A4", name: "A4" },
  { id: "Letter", name: "Letter" },
  { id: "Legal", name: "Legal" },
];

export function TemplateForm({ template, onClose }: TemplateFormProps) {
  const save = useSaveReportCardTemplate();

  const { form, submit, submitting, formError } = useServerForm<TemplateFormValues, ReportCardTemplate>({
    schema: templateSchema,
    defaultValues: template ? templateToValues(template) : templateDefaults,
    onSubmit: async (values) => save.mutateAsync({ id: template?.id, input: valuesToInput(values) }),
    onSuccess: () => onClose(),
  });

  const signatures = form.watch("signatures");

  const addSignature = useCallback(() => {
    const current = form.getValues("signatures");
    form.setValue("signatures", [...current, ""]);
  }, [form]);

  const removeSignature = useCallback(
    (index: number) => {
      const current = form.getValues("signatures");
      form.setValue(
        "signatures",
        current.filter((_, i) => i !== index),
      );
    },
    [form],
  );

  const updateSignature = useCallback(
    (index: number, value: string) => {
      const current = form.getValues("signatures");
      const next = [...current];
      next[index] = value;
      form.setValue("signatures", next);
    },
    [form],
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <FormAlert message={formError} />

        {/* General */}
        <FormSection title="General" description="Template name and scope.">
          <TextField name="name" label="Template name" required maxLength={100} />
          <CheckboxField name="isDefault" label="Set as default template" />
        </FormSection>

        {/* Layout */}
        <FormSection title="Layout" description="Page orientation and paper size.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField name="layout.orientation" label="Orientation" options={ORIENTATION_OPTIONS} />
            <SelectField name="layout.paperSize" label="Paper size" options={PAPER_SIZE_OPTIONS} />
          </div>
        </FormSection>

        {/* Header */}
        <FormSection title="Header" description="Override the school header printed on the report card.">
          <CheckboxField name="header.showLogo" label="Show school logo" />
          <TextField name="header.schoolName" label="School name override" maxLength={200} />
          <TextField name="header.subtitle" label="Subtitle" maxLength={300} />
          <TextField name="header.address" label="Address" maxLength={300} />
          <TextField name="header.phone" label="Phone" maxLength={50} />
        </FormSection>

        {/* Sections */}
        <FormSection title="Sections" description="Choose which sections to include on the report card.">
          <div className="flex flex-col gap-2">
            <CheckboxField name="showGradingScale" label="Grading scale" />
            <CheckboxField name="showSkills" label="Skills assessment" />
            <CheckboxField name="showRemarks" label="Teacher remarks" />
            <CheckboxField name="showAttendance" label="Attendance summary" />
            <CheckboxField name="showPosition" label="Class position / rank" />
          </div>
        </FormSection>

        {/* Signatures */}
        <FormSection title="Signatures" description="Signature lines printed at the bottom.">
          <div className="flex flex-col gap-2">
            {signatures.map((sig, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="h-9 flex-1 rounded-input border border-border bg-surface px-3 text-body text-fg outline-none transition-colors placeholder:text-fg-muted/60 focus:border-primary focus:ring-1 focus:ring-primary"
                  value={sig}
                  onChange={(e) => updateSignature(i, e.target.value)}
                  placeholder="Signature label"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSignature(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" className="self-start" onClick={addSignature}>
              <Plus className="mr-1.5 size-4" />
              Add signature
            </Button>
          </div>
        </FormSection>

        {/* Footer */}
        <FormSection title="Footer" description="Custom text printed at the very bottom.">
          <TextareaField name="footerText" label="Footer text" rows={2} />
        </FormSection>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {template ? "Update template" : "Create template"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

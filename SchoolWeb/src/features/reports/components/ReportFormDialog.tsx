"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import type { Report } from "../types";
import { useReportForm } from "../use-report-form";
import { ReportParamField } from "./ReportParamField";

interface ReportFormDialogProps {
  report: Report;
  onClose: () => void;
}

export function ReportFormDialog({ report, onClose }: ReportFormDialogProps) {
  const reportForm = useReportForm(report, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={report.name}
      description={report.description ?? undefined}
      submitLabel="Generate"
      submitting={reportForm.submitting}
      onSubmit={reportForm.submit}
      form={reportForm.form}
      error={reportForm.formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {report.params.map((param) => (
          <ReportParamField key={param.name} param={param} options={reportForm.optionsFor(param.type)} />
        ))}
        <SelectField name="format" label="Format" options={reportForm.formatOptions} required />
      </div>
    </FormDialog>
  );
}

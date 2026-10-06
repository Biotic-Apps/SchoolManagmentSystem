import { useState } from "react";
import { useWatch } from "react-hook-form";
import { useBranchPicker } from "@/features/branches/use-branch-picker";
import { toast } from "@/lib/toast";
import { useServerForm } from "@/lib/use-server-form";
import { useGenerateReport } from "./api";
import { addRecentExport } from "./recent-exports";
import { reportDefaults, reportSchema, toReportRequest } from "./schemas";
import type { Report } from "./types";
import { useReportParamOptions } from "./use-report-param-options";

/** Parameter form for one report; a successful submit queues the export and closes. */
export function useReportForm(report: Report, onDone: () => void) {
  const picker = useBranchPicker();
  const generate = useGenerateReport();
  const [schema] = useState(() => reportSchema(report));

  const { form, submit, submitting, formError } = useServerForm({
    schema,
    defaultValues: reportDefaults(report, { branchId: picker.branchId }),
    onSubmit: async (values) => {
      const request = toReportRequest(report, values);
      const result = await generate.mutateAsync(request);
      return { request, jobId: result?.jobId ?? result?.id ?? null };
    },
    onSuccess: ({ request, jobId }) => {
      if (jobId) {
        addRecentExport({
          jobId,
          key: report.key,
          name: report.name,
          format: request.format,
          startedAt: new Date().toISOString(),
        });
      }
      toast.success("Report queued. It appears under Recent exports when ready.");
      onDone();
    },
  });

  const branchParam = report.params.find((param) => param.type === "branch")?.name;
  const sessionParam = report.params.find((param) => param.type === "session")?.name;
  const values = useWatch({ control: form.control });
  const branchId = (branchParam ? values[branchParam] : null) || picker.branchId;
  const sessionId = (sessionParam ? values[sessionParam] : null) || null;
  const optionsFor = useReportParamOptions(report, branchId, sessionId);

  return {
    form,
    submit,
    submitting,
    formError,
    optionsFor,
    formatOptions: report.formats.map((format) => ({ id: format, name: format })),
  };
}

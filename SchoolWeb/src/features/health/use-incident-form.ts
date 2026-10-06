import { nowTime } from "@/features/pickup/now-time";
import { toIsoDate } from "@/lib/dates";
import { useServerForm } from "@/lib/use-server-form";
import { useReportIncident } from "./api";
import { incidentDefaults, incidentSchema, toIncidentInput, type IncidentFormValues } from "./schemas";

export function useIncidentForm(onDone: () => void) {
  const report = useReportIncident();
  return useServerForm<IncidentFormValues>({
    schema: incidentSchema,
    defaultValues: incidentDefaults(toIsoDate(new Date()), nowTime()),
    onSubmit: (values) => report.mutateAsync(toIncidentInput(values)),
    onSuccess: onDone,
  });
}

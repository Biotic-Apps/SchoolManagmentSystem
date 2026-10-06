import { useWatch } from "react-hook-form";
import { useServerForm } from "@/lib/use-server-form";
import { useDecideApplication, useRecordTestResult, useScheduleTest } from "./api";
import {
  DECIDE_DEFAULTS,
  decideSchema,
  resultFormDefaults,
  resultSchema,
  testFormDefaults,
  testSchema,
  toDecideInput,
  toResultInput,
  toTestInput,
  type DecideFormValues,
  type ResultFormValues,
  type TestFormValues,
} from "./schemas";
import type { Application } from "./types";

export function useScheduleTestForm(app: Application, onDone: () => void) {
  const schedule = useScheduleTest();
  return useServerForm<TestFormValues>({
    schema: testSchema,
    defaultValues: testFormDefaults(app.test),
    onSubmit: (values) => schedule.mutateAsync({ id: app.id, body: toTestInput(values) }),
    onSuccess: onDone,
  });
}

export function useTestResultForm(app: Application, onDone: () => void) {
  const record = useRecordTestResult();
  return useServerForm<ResultFormValues>({
    schema: resultSchema,
    defaultValues: resultFormDefaults(app.test),
    onSubmit: (values) => record.mutateAsync({ id: app.id, body: toResultInput(values) }),
    onSuccess: onDone,
  });
}

export function useDecideForm(app: Application, onDone: () => void) {
  const decide = useDecideApplication();
  const server = useServerForm<DecideFormValues>({
    schema: decideSchema,
    defaultValues: DECIDE_DEFAULTS,
    onSubmit: (values) => decide.mutateAsync({ id: app.id, body: toDecideInput(values) }),
    onSuccess: onDone,
  });
  const decision = useWatch({ control: server.form.control, name: "decision" });
  return { ...server, reasonRequired: decision === "REJECT", waitlisting: decision === "WAITLIST" };
}

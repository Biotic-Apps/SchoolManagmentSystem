import { useSectionOptions } from "@/features/classes/sections-api";
import { useServerForm } from "@/lib/use-server-form";
import {
  printChallansDefaults,
  printChallansSchema,
  toPrintChallansInput,
  usePrintChallans,
  type PrintChallansJob,
  type PrintChallansValues,
} from "./challan-print";

interface PrintContext {
  branchId: string;
  sessionId: string | null;
  period: string;
  classId?: string;
}

/** Month / class / section filter of a bulk challan print; sections follow the chosen class. */
export function usePrintChallansForm(
  { branchId, sessionId, period, classId }: PrintContext,
  onStarted: (job: PrintChallansJob) => void,
) {
  const print = usePrintChallans();
  const server = useServerForm<PrintChallansValues, PrintChallansJob>({
    schema: printChallansSchema,
    defaultValues: printChallansDefaults(period, classId),
    onSubmit: (values) => print.mutateAsync(toPrintChallansInput(values, branchId)),
    onSuccess: onStarted,
  });
  const chosenClass = server.form.watch("classId");
  const sections = useSectionOptions(chosenClass ? branchId : null, sessionId, chosenClass || null);
  return { ...server, chosenClass, sectionOptions: sections.options };
}

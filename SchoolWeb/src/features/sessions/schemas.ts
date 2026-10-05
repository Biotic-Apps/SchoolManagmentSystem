import { z } from "zod";
import { formatDate } from "@/lib/format";
import { blankToNull, isoDate, optionalText, requiredText } from "@/lib/validation";
import { rangesOverlap, refineEndAfterStart, type DateRange } from "./date-ranges";
import type {
  AcademicSession,
  AcademicSessionInput,
  CalendarEvent,
  CalendarEventInput,
  Term,
  TermInput,
} from "./types";

const dateFields = { startDate: isoDate, endDate: isoDate };

export const sessionSchema = z
  .object({ name: requiredText("the session name", 40), ...dateFields })
  .superRefine(refineEndAfterStart);

export type SessionFormValues = z.infer<typeof sessionSchema>;

export function sessionFormDefaults(session: AcademicSession | null): SessionFormValues {
  return { name: session?.name ?? "", startDate: session?.startDate ?? "", endDate: session?.endDate ?? "" };
}

export function toSessionInput(values: SessionFormValues, branchId: string | null): AcademicSessionInput {
  return {
    ...(branchId ? { branchId } : {}),
    name: values.name.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
  };
}

/** Terms must sit inside the session and must not overlap sibling terms. */
export function termSchema(session: DateRange, siblings: Term[]) {
  return z
    .object({ name: requiredText("the term name", 40), ...dateFields })
    .superRefine(refineEndAfterStart)
    .superRefine((value, ctx) => {
      if (!value.startDate || !value.endDate) return;
      if (value.startDate < session.startDate || value.endDate > session.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDate"],
          message: `Keep the term within ${formatDate(session.startDate)} – ${formatDate(session.endDate)}`,
        });
        return;
      }
      const clash = siblings.find((term) => rangesOverlap(value, term));
      if (clash) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["startDate"], message: `Overlaps ${clash.name}` });
      }
    });
}

export type TermFormValues = z.infer<ReturnType<typeof termSchema>>;

export function termFormDefaults(term: Term | null): TermFormValues {
  return { name: term?.name ?? "", startDate: term?.startDate ?? "", endDate: term?.endDate ?? "" };
}

export function toTermInput(values: TermFormValues): TermInput {
  return { name: values.name.trim(), startDate: values.startDate, endDate: values.endDate };
}

export const EVENT_SCOPES = ["BRANCH", "SCHOOL"] as const;

export const eventSchema = z
  .object({
    type: z.enum(["HOLIDAY", "VACATION", "DEADLINE", "EVENT"], { errorMap: () => ({ message: "Pick a type" }) }),
    title: requiredText("a title", 120),
    ...dateFields,
    description: optionalText(1000),
    scope: z.enum(EVENT_SCOPES),
  })
  .superRefine(refineEndAfterStart);

export type EventFormValues = z.infer<typeof eventSchema>;

export function eventFormDefaults(event: CalendarEvent | null): EventFormValues {
  return {
    type: event?.type ?? "EVENT",
    title: event?.title ?? "",
    startDate: event?.startDate ?? "",
    endDate: event?.endDate ?? "",
    description: event?.description ?? "",
    scope: event && !event.branchId ? "SCHOOL" : "BRANCH",
  };
}

export function toEventInput(
  values: EventFormValues,
  context: { schoolId: string | null; branchId: string | null; event: CalendarEvent | null },
): CalendarEventInput {
  return {
    schoolId: context.event?.schoolId ?? context.schoolId ?? undefined,
    branchId: values.scope === "SCHOOL" ? null : (context.event?.branchId ?? context.branchId),
    type: values.type,
    title: values.title.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    description: blankToNull(values.description),
  };
}

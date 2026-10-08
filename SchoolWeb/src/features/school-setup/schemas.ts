import { z } from "zod";
import {
  optionalEmail,
  optionalPhone,
  optionalText,
  optionalUrl,
  passwordRule,
  requiredText,
  timeOfDay,
} from "@/lib/validation";

const code = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,12}$/, "Use 2–12 letters or digits, e.g. BSS");

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

// The API wants names of 2–120 characters.
const name = (label: string) => requiredText(label).refine((value) => value.length >= 2, "Use at least 2 characters");

const schoolStep = z.object({
  code,
  name: name("the school name"),
  phone: optionalPhone,
  email: optionalEmail,
  website: optionalUrl,
  address: optionalText(),
});

const branchStep = z
  .object({
    name: name("the branch name"),
    code,
    phone: optionalPhone,
    email: optionalEmail,
    address: optionalText(),
    opensAt: timeOfDay,
    closesAt: timeOfDay,
    attendanceLockAt: timeOfDay,
    workingDays: z.array(z.number().int().min(1).max(7)).min(1, "Pick at least one working day"),
  })
  .refine((v) => v.closesAt > v.opensAt, { path: ["closesAt"], message: "Closing time must be after opening time" })
  .refine((v) => v.attendanceLockAt >= v.opensAt && v.attendanceLockAt <= v.closesAt, {
    path: ["attendanceLockAt"],
    message: "Attendance lock must fall within school hours",
  });

const principalStep = z
  .object({
    name: name("the principal's name"),
    email: optionalEmail,
    phone: optionalPhone,
    generatePassword: z.boolean(),
    password: z.string(),
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.phone) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Enter an email or phone number so the principal can sign in" });
    }
    if (!v.generatePassword) {
      const result = passwordRule.safeParse(v.password);
      if (!result.success) ctx.addIssue({ code: "custom", path: ["password"], message: result.error.issues[0].message });
    }
  });

const sectionRow = z.object({ name: z.string(), group: z.string() });
const subjectCell = z.object({ name: z.string(), periodsPerWeek: z.number().int().min(0).max(20), group: z.string() });
const classRow = z.object({
  include: z.boolean(),
  name: z.string().trim(),
  level: z.enum(["EARLY", "PRIMARY", "MIDDLE", "MATRIC", "CUSTOM"]),
  custom: z.boolean(),
  sections: z.array(sectionRow),
  subjects: z.array(subjectCell),
});

const academicsStep = z
  .object({
    createSession: z.boolean(),
    sessionName: z.string().trim().max(30, "Use at most 30 characters"),
    startDate: z.string(),
    endDate: z.string(),
    classes: z.array(classRow),
    /** Columns of the class × subject matrix. */
    subjectNames: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    if (!v.createSession) return;
    if (!isoDate.test(v.startDate)) ctx.addIssue({ code: "custom", path: ["startDate"], message: "Pick the start date" });
    if (!isoDate.test(v.endDate)) ctx.addIssue({ code: "custom", path: ["endDate"], message: "Pick the end date" });
    else if (v.endDate <= v.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "The session must end after it starts" });
    }
    if (v.sessionName.length < 2) ctx.addIssue({ code: "custom", path: ["sessionName"], message: "Enter the session name, e.g. 2026-27" });
    const included = v.classes.filter((row) => row.include);
    if (included.length === 0) ctx.addIssue({ code: "custom", path: ["classes"], message: "Tick at least one class" });
    const seen = new Set<string>();
    v.classes.forEach((row, index) => {
      if (!row.include) return;
      const key = row.name.toLowerCase();
      if (!row.name || row.name.length > 40) {
        ctx.addIssue({ code: "custom", path: ["classes", index, "name"], message: "Use 1–40 characters" });
      } else if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["classes", index, "name"], message: "Another class has this name" });
      }
      seen.add(key);
      if (row.sections.length === 0) {
        ctx.addIssue({ code: "custom", path: ["classes", index, "sections"], message: "Pick at least one section" });
      }
    });
  });

const minutes = (min: number, max: number) => z.number().int().min(min).max(max);

const bellStep = z
  .object({
    startTime: timeOfDay,
    periodMinutes: minutes(10, 120),
    periodsPerDay: minutes(1, 12),
    breakAfter: minutes(0, 11),
    breakMinutes: minutes(0, 90),
    shortFriday: z.boolean(),
    friday: z.object({ periodMinutes: minutes(10, 120), periodsPerDay: minutes(1, 12), breakMinutes: minutes(0, 90) }),
  })
  .refine((v) => v.breakAfter < v.periodsPerDay, { path: ["breakAfter"], message: "Pick a period before the last one (0 = no break)" });

export const setupSchema = z.object({
  school: schoolStep,
  branch: branchStep,
  principal: principalStep,
  academics: academicsStep,
  bell: bellStep,
});

export type SetupFormValues = z.infer<typeof setupSchema>;
export type BellStepValues = SetupFormValues["bell"];

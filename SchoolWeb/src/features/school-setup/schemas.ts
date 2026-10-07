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

const academicsStep = z
  .object({
    createSession: z.boolean(),
    sessionName: z.string().trim().max(30, "Use at most 30 characters"),
    startDate: z.string(),
    endDate: z.string(),
    sectionsPerClass: z.enum(["1", "2", "3", "4"]),
    classes: z.array(z.string()),
    subjects: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    if (!v.createSession) return;
    if (!isoDate.test(v.startDate)) ctx.addIssue({ code: "custom", path: ["startDate"], message: "Pick the start date" });
    if (!isoDate.test(v.endDate)) ctx.addIssue({ code: "custom", path: ["endDate"], message: "Pick the end date" });
    else if (v.endDate <= v.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "The session must end after it starts" });
    }
    if (v.sessionName.length < 2) ctx.addIssue({ code: "custom", path: ["sessionName"], message: "Enter the session name, e.g. 2026-27" });
  });

export const setupSchema = z.object({
  school: schoolStep,
  branch: branchStep,
  principal: principalStep,
  academics: academicsStep,
});

export type SetupFormValues = z.infer<typeof setupSchema>;

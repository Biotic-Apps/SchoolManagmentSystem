import { z } from "zod";

export const TEST_MESSAGE_CHANNELS = [
  { id: "EMAIL", name: "Email" },
  { id: "SMS", name: "SMS" },
];

export const testMessageSchema = z
  .object({
    channel: z.enum(["EMAIL", "SMS"]),
    to: z.string().trim().min(1, "Enter where to send the test"),
  })
  .superRefine((values, ctx) => {
    if (values.channel === "EMAIL" && !z.string().email().safeParse(values.to).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to"], message: "Enter a valid email address" });
    }
    if (values.channel === "SMS" && !/^\+?[\d\s()-]{7,20}$/.test(values.to)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to"], message: "Enter a mobile number like 0300 1234567" });
    }
  });

export type TestMessageValues = z.infer<typeof testMessageSchema>;

/** POST /support/test-message: provider failures come back as `{ ok: false, error }`. */
export interface TestMessageResult {
  ok: boolean;
  error?: string;
}

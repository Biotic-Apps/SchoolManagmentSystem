import { z } from "zod";
import { blankToUndefined, optionalIsoDate, requiredText } from "@/lib/validation";
import type { Notice, NoticeInput } from "./types";

export const noticeSchema = z
  .object({
    title: requiredText("a title", 150),
    body: requiredText("the notice text", 5000),
    schoolWide: z.boolean(),
    branchIds: z.array(z.string()),
    classIds: z.array(z.string()),
    sectionIds: z.array(z.string()),
    staffOnly: z.boolean(),
    expiresOn: optionalIsoDate,
    pinned: z.boolean(),
    attachmentFileIds: z.array(z.string()),
  })
  .refine(
    (values) =>
      values.schoolWide || values.branchIds.length + values.classIds.length + values.sectionIds.length > 0,
    { path: ["schoolWide"], message: "Choose who receives this notice" },
  );
export type NoticeFormValues = z.infer<typeof noticeSchema>;

export const noticeDefaults = (notice: Notice | null, branchId: string | null): NoticeFormValues => ({
  title: notice?.title ?? "",
  body: notice?.body ?? "",
  schoolWide: notice?.audience.schoolWide ?? false,
  branchIds: notice?.audience.branchIds ?? (branchId ? [branchId] : []),
  classIds: notice?.audience.classIds ?? [],
  sectionIds: notice?.audience.sectionIds ?? [],
  staffOnly: notice?.audience.staffOnly ?? false,
  expiresOn: notice?.expiresOn ?? "",
  pinned: notice?.pinned ?? false,
  attachmentFileIds: notice?.attachments.map((file) => file.id) ?? [],
});

export function toNoticeInput(values: NoticeFormValues): NoticeInput {
  const audience = values.schoolWide
    ? { schoolWide: true, staffOnly: values.staffOnly }
    : {
        branchIds: values.branchIds,
        classIds: values.classIds,
        sectionIds: values.sectionIds,
        staffOnly: values.staffOnly,
      };
  return {
    title: values.title.trim(),
    body: values.body.trim(),
    audience,
    attachmentFileIds: values.attachmentFileIds,
    expiresOn: blankToUndefined(values.expiresOn),
    pinned: values.pinned,
  };
}

import { z } from "zod";
import { requiredText, wholeNumberText } from "@/lib/validation";
import type {
  Room,
  RoomInput,
  SchoolClassInput,
  Section,
  SectionCreateInput,
  SectionUpdateInput,
  Subject,
  SubjectInput,
} from "./types";

const numberOrNull = (value: string) => (value.trim() ? Number(value) : null);

export const classSchema = z.object({
  name: requiredText("the class name", 40),
});
export type ClassFormValues = z.infer<typeof classSchema>;

/** New classes go after the most senior one; reorder later from the Classes page. */
export const toClassInput = (values: ClassFormValues, levelOrder: number): SchoolClassInput => ({
  name: values.name.trim(),
  levelOrder,
});

export const subjectSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{2,12}$/, "Use 2–12 uppercase letters, digits or hyphens"),
  name: requiredText("the subject name", 80),
});
export type SubjectFormValues = z.infer<typeof subjectSchema>;

export const subjectFormDefaults = (item: Subject | null): SubjectFormValues => ({
  code: item?.code ?? "",
  name: item?.name ?? "",
});

export const toSubjectInput = (values: SubjectFormValues): SubjectInput => ({
  code: values.code,
  name: values.name.trim(),
});

export const roomSchema = z.object({
  name: requiredText("the room name", 60),
  capacity: wholeNumberText("the capacity", { min: 1, required: false }),
});
export type RoomFormValues = z.infer<typeof roomSchema>;

export const roomFormDefaults = (item: Room | null): RoomFormValues => ({
  name: item?.name ?? "",
  capacity: item?.capacity != null ? String(item.capacity) : "",
});

export const toRoomInput = (values: RoomFormValues): RoomInput => ({
  name: values.name.trim(),
  capacity: numberOrNull(values.capacity),
});

export const sectionSchema = z.object({
  sessionId: z.string().min(1, "Choose a session"),
  classId: z.string().min(1, "Choose a class"),
  name: requiredText("the section name", 40),
  capacity: wholeNumberText("the capacity", { min: 1 }),
  roomId: z.string(),
});
export type SectionFormValues = z.infer<typeof sectionSchema>;

export function sectionFormDefaults(
  item: Section | null,
  context: { sessionId: string | null; classId: string | undefined },
): SectionFormValues {
  return {
    sessionId: item?.sessionId ?? context.sessionId ?? "",
    classId: item?.classId ?? context.classId ?? "",
    name: item?.name ?? "",
    capacity: item ? String(item.capacity) : "",
    roomId: item?.room?.id ?? "",
  };
}

export const toSectionUpdate = (values: SectionFormValues): SectionUpdateInput => ({
  name: values.name.trim(),
  capacity: Number(values.capacity),
  roomId: values.roomId || null,
});

export function toSectionCreate(values: SectionFormValues, branchId: string): SectionCreateInput {
  return {
    branchId,
    sessionId: values.sessionId,
    classId: values.classId,
    name: values.name.trim(),
    capacity: Number(values.capacity),
    ...(values.roomId ? { roomId: values.roomId } : {}),
  };
}

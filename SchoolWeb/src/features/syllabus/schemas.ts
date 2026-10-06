import { z } from "zod";
import { toIsoDate } from "@/lib/dates";
import { blankToUndefined, isoDate, optionalIsoDate, optionalText, requiredText } from "@/lib/validation";
import { byOrder } from "./options";
import type { BookList, BookListDraftInput, PlanDraftInput, SyllabusPlan, Topic, TopicProgressInput } from "./types";

const rupees = z
  .string()
  .trim()
  .refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), { message: "Enter the price in rupees, e.g. 450" });

const bookItemSchema = z.object({
  subjectId: z.string(),
  title: requiredText("the book title", 200),
  author: optionalText(120),
  publisher: optionalText(120),
  isbn: optionalText(20),
  isMandatory: z.boolean(),
  price: rupees,
});

export const bookListSchema = z.object({ items: z.array(bookItemSchema).min(1, "Add at least one book") });
export type BookListValues = z.infer<typeof bookListSchema>;
export type BookItemValues = z.infer<typeof bookItemSchema>;

export const EMPTY_BOOK: BookItemValues = {
  subjectId: "",
  title: "",
  author: "",
  publisher: "",
  isbn: "",
  isMandatory: true,
  price: "",
};

export const bookListDefaults = (source: BookList | null): BookListValues => ({
  items: source?.items.length
    ? source.items.map((item) => ({
        subjectId: item.subjectId ?? "",
        title: item.title,
        author: item.author ?? "",
        publisher: item.publisher ?? "",
        isbn: item.isbn ?? "",
        isMandatory: item.isMandatory,
        price: item.priceMinor === null ? "" : String(item.priceMinor / 100),
      }))
    : [{ ...EMPTY_BOOK }],
});

export const toBookListInput = (values: BookListValues, branchId: string, sessionId: string): BookListDraftInput => ({
  branchId,
  sessionId,
  items: values.items.map((item) => ({
    subjectId: blankToUndefined(item.subjectId),
    title: item.title.trim(),
    author: blankToUndefined(item.author),
    publisher: blankToUndefined(item.publisher),
    isbn: blankToUndefined(item.isbn),
    isMandatory: item.isMandatory,
    priceMinor: item.price ? Math.round(Number(item.price) * 100) : undefined,
  })),
});

const topicSchema = z.object({ title: requiredText("the topic", 200), targetDate: isoDate });
const chapterSchema = z.object({
  title: requiredText("the chapter title", 200),
  topics: z.array(topicSchema).min(1, "Add at least one topic"),
});

export const planSchema = z.object({ chapters: z.array(chapterSchema).min(1, "Add at least one chapter") });
export type PlanValues = z.infer<typeof planSchema>;

export const EMPTY_TOPIC = { title: "", targetDate: "" };
export const emptyChapter = () => ({ title: "", topics: [{ ...EMPTY_TOPIC }] });

export const planDefaults = (source: SyllabusPlan | null): PlanValues => ({
  chapters: source?.chapters.length
    ? byOrder(source.chapters).map((chapter) => ({
        title: chapter.title,
        topics: byOrder(chapter.topics).map((topic) => ({ title: topic.title, targetDate: topic.targetDate ?? "" })),
      }))
    : [emptyChapter()],
});

export const toPlanInput = (
  values: PlanValues,
  scope: { sectionId: string; subjectId: string; sessionId: string },
): PlanDraftInput => ({
  ...scope,
  chapters: values.chapters.map((chapter, index) => ({
    title: chapter.title.trim(),
    order: index + 1,
    topics: chapter.topics.map((topic, position) => ({
      title: topic.title.trim(),
      order: position + 1,
      targetDate: topic.targetDate,
    })),
  })),
});

export const topicProgressSchema = z
  .object({
    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),
    completedOn: optionalIsoDate,
    note: optionalText(500),
  })
  .refine((values) => values.status !== "COMPLETED" || !!values.completedOn, {
    message: "Pick the date it was completed",
    path: ["completedOn"],
  });
export type TopicProgressValues = z.infer<typeof topicProgressSchema>;

export const topicProgressDefaults = (topic: Topic): TopicProgressValues => ({
  status: topic.status,
  completedOn: topic.completedOn ?? toIsoDate(new Date()),
  note: "",
});

export const toTopicProgressInput = (values: TopicProgressValues): TopicProgressInput => ({
  status: values.status,
  completedOn: values.status === "COMPLETED" ? values.completedOn : undefined,
  note: blankToUndefined(values.note),
});

import { z } from "zod";
import { requiredText } from "@/lib/validation";
import type { Question, QuestionInput, QuestionType, QuestionUpdate, DifficultyLevel } from "./types";

const QUESTION_TYPES: QuestionType[] = ["MCQ", "SHORT", "LONG", "TRUE_FALSE", "FILL_BLANK"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

const MAX_OPTIONS = 10;

/** One option per line, trimmed, blank lines dropped. */
export const parseOptions = (text: string | undefined): string[] =>
  (text ?? "").split("\n").map((o) => o.trim()).filter(Boolean);

const intIn = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, message)
    .refine((v) => Number(v) >= min && Number(v) <= max, message);

export const questionSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  classId: z.string().min(1, "Choose a class"),
  chapterName: requiredText("a chapter name", 150),
  // Plain strings so the form can start empty (""); refine enforces a real choice.
  questionType: z.string().refine((v) => QUESTION_TYPES.includes(v as QuestionType), "Choose a type"),
  difficultyLevel: z.string().refine((v) => DIFFICULTY_LEVELS.includes(v as DifficultyLevel), "Choose difficulty"),
  marks: z
    .string()
    .regex(/^\d{1,3}$/, "Enter marks (1-100)")
    .refine((v) => Number(v) >= 1 && Number(v) <= 100, "Enter marks (1-100)"),
  questionText: requiredText("the question", 5000),
  options: z.string().optional(),
  correctAnswer: requiredText("the correct answer", 2000),
}).superRefine((values, ctx) => {
  // Same rules as the API (question-rules.ts checkAnswer).
  const answer = values.correctAnswer.trim().toLowerCase();
  if (values.questionType === "MCQ") {
    const options = parseOptions(values.options);
    const keys = options.map((o) => o.toLowerCase());
    const optionIssue =
      options.length < 2 || options.length > MAX_OPTIONS
        ? `Enter 2-${MAX_OPTIONS} options, one per line`
        : options.some((o) => o.length > 500)
          ? "Each option can be at most 500 characters"
          : new Set(keys).size !== keys.length
            ? "Options must all be different"
            : null;
    if (optionIssue) ctx.addIssue({ code: "custom", path: ["options"], message: optionIssue });
    else if (answer && !keys.includes(answer))
      ctx.addIssue({ code: "custom", path: ["correctAnswer"], message: "The correct answer must be one of the options" });
  }
  if (values.questionType === "TRUE_FALSE" && answer && answer !== "true" && answer !== "false")
    ctx.addIssue({ code: "custom", path: ["correctAnswer"], message: "Enter True or False" });
});
export type QuestionFormValues = z.infer<typeof questionSchema>;

export function questionDefaults(question: Question | null): QuestionFormValues {
  return {
    subjectId: question?.subjectId ?? "",
    classId: question?.classId ?? "",
    chapterName: question?.chapterName ?? "",
    questionType: question?.questionType ?? "",
    difficultyLevel: question?.difficultyLevel ?? "",
    marks: question ? String(question.marks) : "",
    questionText: question?.questionText ?? "",
    options: question?.options ? question.options.join("\n") : "",
    correctAnswer: question?.correctAnswer ?? "",
  };
}

export function toQuestionInput(values: QuestionFormValues, schoolId: string): QuestionInput {
  return { schoolId, subjectId: values.subjectId, classId: values.classId, ...toQuestionUpdate(values) };
}

/** UpdateQuestionDto rejects schoolId/subjectId/classId, so an edit sends only the editable fields. */
export function toQuestionUpdate(values: QuestionFormValues): QuestionUpdate {
  return {
    chapterName: values.chapterName.trim(),
    questionType: values.questionType as QuestionType,
    difficultyLevel: values.difficultyLevel as DifficultyLevel,
    marks: Number(values.marks),
    questionText: values.questionText.trim(),
    ...(values.questionType === "MCQ" ? { options: parseOptions(values.options) } : {}),
    correctAnswer: values.correctAnswer.trim(),
  };
}

export const generatePaperSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  classId: z.string().min(1, "Choose a class"),
  title: requiredText("a title", 200),
  totalMarks: intIn(1, 500, "Enter total marks (1-500)"),
  duration: z
    .string()
    .regex(/^\d{1,3}$/, "Enter duration in minutes")
    .refine((v) => Number(v) >= 10 && Number(v) <= 300, "Duration must be 10-300 minutes"),
  sections: z.array(
    z.object({
      title: requiredText("section title", 100),
      questionCount: intIn(1, 50, "Enter 1-50 questions"),
      type: z.enum(["MCQ", "SHORT", "LONG", "TRUE_FALSE", "FILL_BLANK"], { message: "Choose type" }),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"], { message: "Choose difficulty" }),
      marksPerQuestion: intIn(1, 100, "Enter marks per question (1-100)"),
    }),
  ).min(1, "Add at least one section"),
}).superRefine((values, ctx) => {
  // The API refuses a paper whose sections do not add up to the total.
  const total = Number(values.totalMarks);
  const sum = values.sections.reduce(
    (acc, s) => acc + Number(s.questionCount) * Number(s.marksPerQuestion),
    0,
  );
  if (Number.isFinite(sum) && total > 0 && sum !== total)
    ctx.addIssue({
      code: "custom",
      path: ["totalMarks"],
      message: `Sections add up to ${sum} marks; make the total ${sum} or change the sections`,
    });
});
export type GeneratePaperFormValues = z.infer<typeof generatePaperSchema>;

export function generatePaperDefaults(): GeneratePaperFormValues {
  return {
    subjectId: "",
    classId: "",
    title: "",
    totalMarks: "",
    duration: "",
    sections: [
      { title: "Section A", questionCount: "5", type: "MCQ", difficulty: "EASY", marksPerQuestion: "1" },
    ],
  };
}

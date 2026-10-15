import { z } from "zod";
import { requiredText } from "@/lib/validation";
import type { Question, QuestionInput, QuestionType, QuestionUpdate, DifficultyLevel } from "./types";

const QUESTION_TYPES: QuestionType[] = ["MCQ", "SHORT", "LONG", "TRUE_FALSE", "FILL_BLANK"];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

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
    ...(values.questionType === "MCQ" && values.options
      ? { options: values.options.split("\n").map((o) => o.trim()).filter(Boolean) }
      : {}),
    correctAnswer: values.correctAnswer.trim(),
  };
}

export const generatePaperSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  classId: z.string().min(1, "Choose a class"),
  title: requiredText("a title", 200),
  totalMarks: z.string().regex(/^[1-9]\d{0,2}$/, "Enter total marks (1-500)"),
  duration: z
    .string()
    .regex(/^\d{1,3}$/, "Enter duration in minutes")
    .refine((v) => Number(v) >= 10 && Number(v) <= 300, "Duration must be 10-300 minutes"),
  sections: z.array(
    z.object({
      title: requiredText("section title", 100),
      questionCount: z.string().regex(/^[1-9]\d{0,1}$/, "Enter question count"),
      type: z.enum(["MCQ", "SHORT", "LONG", "TRUE_FALSE", "FILL_BLANK"], { message: "Choose type" }),
      difficulty: z.enum(["EASY", "MEDIUM", "HARD"], { message: "Choose difficulty" }),
      marksPerQuestion: z.string().regex(/^[1-9]\d{0,1}$/, "Enter marks per question"),
    }),
  ).min(1, "Add at least one section"),
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

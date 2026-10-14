export type QuestionType = "MCQ" | "SHORT" | "LONG" | "TRUE_FALSE" | "FILL_BLANK";
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";
export type ExamPaperStatus = "DRAFT" | "PUBLISHED";

export interface Question {
  id: string;
  schoolId: string;
  subjectId: string;
  classId: string;
  chapterName: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  marks: number;
  questionText: string;
  options: string[] | null;
  correctAnswer: string;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
}

export interface QuestionInput {
  schoolId: string;
  subjectId: string;
  classId: string;
  chapterName: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  marks: number;
  questionText: string;
  options?: string[];
  correctAnswer: string;
}

/** UpdateQuestionDto: school, subject and class are fixed once a question exists. */
export type QuestionUpdate = Omit<QuestionInput, "schoolId" | "subjectId" | "classId">;

export interface PaperSection {
  title: string;
  questionIds: string[];
  marks: number;
}

export interface ExamPaper {
  id: string;
  schoolId: string;
  subjectId: string;
  classId: string;
  title: string;
  totalMarks: number;
  duration: number;
  sections: PaperSection[];
  status: ExamPaperStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
}

export interface GenerateSectionInput {
  title: string;
  questionCount: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marksPerQuestion: number;
}

export interface GenerateExamPaperInput {
  schoolId: string;
  subjectId: string;
  classId: string;
  title: string;
  totalMarks: number;
  duration: number;
  sections: GenerateSectionInput[];
}

import type { Question, ExamPaper } from '../../generated/prisma/client';
import type { QuestionDto } from './dto/question.dto';
import type { ExamPaperDto, PaperSectionDto } from './dto/exam-paper.dto';

type QuestionWithRefs = Question & {
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
};

type ExamPaperWithRefs = ExamPaper & {
  subject?: { id: string; name: string } | null;
  class?: { id: string; name: string } | null;
};

export function toQuestionDto(row: QuestionWithRefs): QuestionDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    subjectId: row.subjectId,
    classId: row.classId,
    chapterName: row.chapterName,
    questionType: row.questionType,
    difficultyLevel: row.difficultyLevel,
    marks: row.marks,
    questionText: row.questionText,
    options: row.options as string[] | null,
    correctAnswer: row.correctAnswer,
    status: row.status,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    subject: row.subject ?? null,
    class: row.class ?? null,
  };
}

export function toExamPaperDto(row: ExamPaperWithRefs): ExamPaperDto {
  return {
    id: row.id,
    schoolId: row.schoolId,
    subjectId: row.subjectId,
    classId: row.classId,
    title: row.title,
    totalMarks: row.totalMarks,
    duration: row.duration,
    sections: row.sections as PaperSectionDto[],
    status: row.status,
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    subject: row.subject ?? null,
    class: row.class ?? null,
  };
}

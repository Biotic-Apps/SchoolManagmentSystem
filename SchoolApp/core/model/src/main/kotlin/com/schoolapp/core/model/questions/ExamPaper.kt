package com.schoolapp.core.model.questions

data class PaperSection(val title: String, val questionIds: List<String>, val marks: Int)

/** A paper generated from the question bank. */
data class ExamPaper(
    val id: String,
    val schoolId: String,
    val subjectId: String,
    val classId: String,
    val subjectName: String?,
    val className: String?,
    val title: String,
    val totalMarks: Int,
    val durationMinutes: Int,
    val sections: List<PaperSection>,
    val status: PaperStatus,
    val createdAt: String?,
) {
    val questionCount: Int get() = sections.sumOf { it.questionIds.size }
}

data class GenerateSection(
    val title: String,
    val questionCount: Int,
    val type: QuestionType,
    val difficulty: Difficulty,
    val marksPerQuestion: Int,
)

/** `POST /exam-papers/generate`: random questions are picked per [sections] entry. */
data class GeneratePaperInput(
    val schoolId: String,
    val subjectId: String,
    val classId: String,
    val title: String,
    val totalMarks: Int,
    val durationMinutes: Int,
    val sections: List<GenerateSection>,
)

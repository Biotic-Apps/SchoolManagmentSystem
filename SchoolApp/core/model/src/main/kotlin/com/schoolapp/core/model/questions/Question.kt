package com.schoolapp.core.model.questions

/** A question in the bank; [options] is empty unless [type] is MCQ. */
data class Question(
    val id: String,
    val schoolId: String,
    val subjectId: String,
    val classId: String,
    val subjectName: String?,
    val className: String?,
    val chapterName: String,
    val type: QuestionType?,
    val difficulty: Difficulty?,
    val marks: Int,
    val text: String,
    val options: List<String>,
    val correctAnswer: String,
    val createdAt: String?,
)

/** Values of the add/edit question form; subject and class are fixed once a question exists. */
data class QuestionInput(
    val schoolId: String,
    val subjectId: String,
    val classId: String,
    val chapterName: String,
    val type: QuestionType,
    val difficulty: Difficulty,
    val marks: Int,
    val text: String,
    val options: List<String>,
    val correctAnswer: String,
)

/** Filters of the question list; null means "all". */
data class QuestionFilter(
    val schoolId: String?,
    val subjectId: String? = null,
    val classId: String? = null,
    val type: QuestionType? = null,
    val difficulty: Difficulty? = null,
    val search: String? = null,
)

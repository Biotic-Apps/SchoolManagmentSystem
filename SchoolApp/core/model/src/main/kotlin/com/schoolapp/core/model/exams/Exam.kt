package com.schoolapp.core.model.exams

enum class ExamStatus { DRAFT, SCHEDULED, MARKS_OPEN, MARKS_CLOSED, RESULTS_APPROVED, PUBLISHED }

enum class ExamType { TERM, MIDTERM, UNIT_TEST, FINAL }

data class Exam(
    val id: String,
    val name: String,
    val type: ExamType?,
    val status: ExamStatus,
    val termName: String?,
)

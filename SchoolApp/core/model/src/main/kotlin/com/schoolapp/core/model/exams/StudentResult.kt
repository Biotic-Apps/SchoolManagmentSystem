package com.schoolapp.core.model.exams

data class SubjectResult(
    val subjectId: String?,
    val name: String,
    val marks: Double?,
    val maxMarks: Double,
    val absent: Boolean,
    val grade: String?,
    val passed: Boolean,
)

/** One student's published result for one exam. */
data class StudentResult(
    val studentId: String,
    val name: String,
    val rollNo: Int?,
    val examId: String,
    val examName: String,
    val publishedAt: String?,
    val subjects: List<SubjectResult>,
    val totalMarks: Double,
    val maxTotal: Double,
    val percent: Double,
    val grade: String?,
    val position: Int?,
    val passed: Boolean,
    val remarks: String?,
    val teacherRemark: String?,
)

data class TrendPoint(val examId: String, val examName: String, val percent: Double)

/** `GET /students/:id/results`: published results (newest first) and the percentage trend (oldest first). */
data class ChildResults(val results: List<StudentResult>, val trend: List<TrendPoint>)

enum class ReportCardStatus { PENDING, READY, FAILED }

data class ReportCard(val status: ReportCardStatus, val fileUrl: String?, val generatedAt: String?)

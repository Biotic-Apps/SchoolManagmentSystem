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

/** One student's computed result for one exam (parents only see published ones). */
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
    val classId: String? = null,
    val sectionId: String? = null,
)

data class TrendPoint(val examId: String, val examName: String, val percent: Double)

/** `GET /students/:id/results`: published results (newest first) and the percentage trend (oldest first). */
data class ChildResults(val results: List<StudentResult>, val trend: List<TrendPoint>)

enum class ReportCardStatus { PENDING, READY, FAILED }

data class ReportCard(val status: ReportCardStatus, val fileUrl: String?, val generatedAt: String?)

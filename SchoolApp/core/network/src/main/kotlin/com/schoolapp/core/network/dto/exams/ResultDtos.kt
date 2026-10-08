package com.schoolapp.core.network.dto.exams

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class SubjectResultDto(
    val subjectId: String? = null,
    val name: String = "",
    val marks: Double? = null,
    val maxMarks: Double = 0.0,
    val absent: Boolean = false,
    val grade: String? = null,
    val passed: Boolean = false,
)

@Serializable
data class StudentResultDto(
    val studentId: String = "",
    val name: String = "",
    val rollNo: Int? = null,
    val examId: String = "",
    val classId: String? = null,
    val sectionId: String? = null,
    val exam: IdNameDto? = null,
    val examName: String? = null,
    val publishedAt: String? = null,
    val subjects: List<SubjectResultDto> = emptyList(),
    val totalMarks: Double = 0.0,
    val maxTotal: Double = 0.0,
    val percent: Double = 0.0,
    val grade: String? = null,
    val position: Int? = null,
    val passed: Boolean = false,
    val remarks: String? = null,
    val teacherRemark: String? = null,
)

@Serializable
data class TrendPointDto(
    val examId: String = "",
    val examName: String? = null,
    val name: String? = null,
    val percent: Double = 0.0,
)

@Serializable
data class ReportCardDto(
    val status: String? = null,
    val fileUrl: String? = null,
    val generatedAt: String? = null,
)

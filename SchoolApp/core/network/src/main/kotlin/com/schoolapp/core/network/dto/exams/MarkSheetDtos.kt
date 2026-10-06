package com.schoolapp.core.network.dto.exams

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class PaperDto(
    val classId: String? = null,
    val className: String? = null,
    val subject: IdNameDto? = null,
    val maxMarks: Double = 0.0,
    val passMarks: Double? = null,
    val date: String? = null,
)

@Serializable
data class MarkRowDto(
    val studentId: String,
    val name: String = "",
    val rollNo: Int? = null,
    val marks: Double? = null,
    val absent: Boolean = false,
    val remark: String? = null,
)

@Serializable
data class MarkSheetDto(
    val id: String,
    val examId: String = "",
    val exam: IdNameDto? = null,
    val paper: PaperDto? = null,
    val sectionId: String = "",
    val sectionName: String? = null,
    val status: String? = null,
    val teacher: IdNameDto? = null,
    val entered: Int = 0,
    val total: Int = 0,
    val comment: String? = null,
    val rows: List<MarkRowDto>? = null,
)

/** `PUT /mark-sheets/:id`; `marks: null` = pending. */
@Serializable
data class MarkSheetBodyDto(
    val rows: List<MarkInputDto>,
    val clientRequestId: String? = null,
)

@Serializable
data class MarkInputDto(
    val studentId: String,
    val marks: Double?,
    val absent: Boolean,
    val remark: String? = null,
)

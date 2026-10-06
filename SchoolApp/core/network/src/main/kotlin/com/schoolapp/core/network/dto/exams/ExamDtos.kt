package com.schoolapp.core.network.dto.exams

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.Serializable

@Serializable
data class ExamDto(
    val id: String,
    val name: String = "",
    val type: String? = null,
    val status: String? = null,
    val term: IdNameDto? = null,
    val termName: String? = null,
)

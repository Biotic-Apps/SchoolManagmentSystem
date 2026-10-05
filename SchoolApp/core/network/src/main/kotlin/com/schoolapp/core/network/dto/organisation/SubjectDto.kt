package com.schoolapp.core.network.dto.organisation

import kotlinx.serialization.Serializable

@Serializable
data class SubjectDto(val id: String, val schoolId: String? = null, val code: String? = null, val name: String)

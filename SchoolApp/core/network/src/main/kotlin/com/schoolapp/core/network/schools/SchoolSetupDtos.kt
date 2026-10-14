package com.schoolapp.core.network.schools

import kotlinx.serialization.Serializable

@Serializable
data class SetupEntityDto(val id: String, val code: String = "", val name: String = "")

@Serializable
data class SetupPrincipalDto(
    val id: String,
    val name: String = "",
    val email: String? = null,
    val phone: String? = null,
    val temporaryPassword: String? = null,
)

@Serializable
data class SetupSessionDto(val id: String, val name: String = "", val startDate: String = "", val endDate: String = "")

@Serializable
data class SetupCountsDto(
    val classes: Int = 0,
    val sections: Int = 0,
    val subjects: Int = 0,
    val classSubjects: Int = 0,
    val periods: Int = 0,
)

/** `POST /schools/setup` result. */
@Serializable
data class SchoolSetupResultDto(
    val school: SetupEntityDto,
    val branch: SetupEntityDto,
    val principal: SetupPrincipalDto,
    val session: SetupSessionDto? = null,
    val counts: SetupCountsDto = SetupCountsDto(),
)

package com.schoolapp.core.network.dto.allocation

import com.schoolapp.core.network.dto.common.IdNameDto
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** `GET /classes/:id/setup` (academics-timetable contract §5.2). */
@Serializable
data class ClassSetupDto(
    @SerialName("class") val schoolClass: SetupClassDto,
    val branchId: String? = null,
    val sessionId: String? = null,
    val sections: List<SetupSectionDto> = emptyList(),
    val subjects: List<SetupSubjectDto> = emptyList(),
    val allocation: List<AllocationRowDto> = emptyList(),
    val groups: List<String> = emptyList(),
    val canEditStructure: Boolean = false,
    val canAllocate: Boolean = false,
)

@Serializable
data class SetupClassDto(val id: String? = null, val name: String? = null, val levelOrder: Int = 0, val status: String? = null)

@Serializable
data class SetupSectionDto(
    val id: String,
    val name: String,
    val group: String? = null,
    val classTeacher: IdNameDto? = null,
    val studentCount: Int = 0,
    val capacity: Int? = null,
    val room: IdNameDto? = null,
    val timetable: String? = null,
)

@Serializable
data class SetupSubjectDto(
    val subjectId: String,
    val name: String,
    val code: String? = null,
    val periodsPerWeek: Int? = null,
    val isOptional: Boolean = false,
    val group: String? = null,
    val sortOrder: Int = 0,
)

/** One section × subject cell; also the `PUT /sections/:id/subject-teachers/:subjectId` response. */
@Serializable
data class AllocationRowDto(
    val sectionId: String,
    val subjectId: String? = null,
    val staff: IdNameDto? = null,
    val assignmentId: String? = null,
    val placed: Int = 0,
)

/** `PUT /sections/:id/class-teacher` and `.../subject-teachers/:subjectId` body. */
@Serializable
data class SetTeacherRequest(val staffId: String?)

package com.schoolapp.core.network.dto.activity

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.common.UserRefDto
import kotlinx.serialization.Serializable

@Serializable
data class ActivityDto(
    val id: String,
    val branchId: String? = null,
    val reason: String? = null,
    val createdAt: String? = null,
    val type: String? = null,
    val title: String = "",
    val description: String? = null,
    val startAt: String = "",
    val endAt: String? = null,
    val venue: String? = null,
    val status: String? = null,
    val consentRequired: Boolean = false,
    val consentDeadline: String? = null,
    val feeMinor: Long? = null,
    val maxParticipants: Int? = null,
    val audience: ActivityAudienceDto? = null,
    val audienceLabel: String? = null,
    val proposedBy: UserRefDto? = null,
    val createdBy: UserRefDto? = null,
    /** Parent view: the child's consent as `consent: { status }`, `consentStatus` or `myConsent`. */
    val consent: ConsentRefDto? = null,
    val consentStatus: String? = null,
    val myConsent: String? = null,
    val studentId: String? = null,
    val student: IdNameDto? = null,
)

@Serializable
data class ActivityAudienceDto(
    val sectionIds: List<String>? = null,
    val classIds: List<String>? = null,
    val wholeBranch: Boolean? = null,
    val label: String? = null,
)

@Serializable
data class ConsentRefDto(val status: String? = null, val respondedAt: String? = null)

/** `POST /activities`; also `PATCH /activities/{id}` with [branchId] left null (omitted). */
@Serializable
data class ActivityBodyDto(
    val branchId: String? = null,
    val type: String,
    val title: String,
    val description: String,
    val startAt: String,
    val endAt: String,
    val venue: String? = null,
    val audience: ActivityAudienceBodyDto,
    val consentRequired: Boolean,
    val consentDeadline: String? = null,
    val feeMinor: Long? = null,
    val maxParticipants: Int? = null,
)

@Serializable
data class ActivityAudienceBodyDto(
    val sectionIds: List<String>? = null,
    val classIds: List<String>? = null,
    val wholeBranch: Boolean? = null,
)

@Serializable
data class ConsentDto(
    val student: IdNameDto? = null,
    val studentId: String? = null,
    val studentName: String? = null,
    val guardian: IdNameDto? = null,
    val status: String? = null,
    val respondedAt: String? = null,
)

@Serializable
data class ConsentBodyDto(val studentId: String, val decision: String, val note: String? = null)

@Serializable
data class ParticipantDto(
    val student: IdNameDto? = null,
    val studentId: String? = null,
    val studentName: String? = null,
    val role: String? = null,
    val result: String? = null,
    val position: Int? = null,
    val remarks: String? = null,
)

/** `POST /activities/{id}/status`: ONGOING, COMPLETED or CANCELLED (with a reason). */
@Serializable
data class ActivityStatusBodyDto(val status: String, val reason: String? = null)

/** `PUT /activities/{id}/participants` replaces the whole roster. */
@Serializable
data class ParticipantsBodyDto(val participants: List<ParticipantInputDto>)

@Serializable
data class ParticipantInputDto(
    val studentId: String,
    val role: String? = null,
    val result: String? = null,
    val position: Int? = null,
    val remarks: String? = null,
)

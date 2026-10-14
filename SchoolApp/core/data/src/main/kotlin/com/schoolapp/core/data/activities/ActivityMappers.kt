package com.schoolapp.core.data.activities

import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityAudience
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.common.enumOrNull
import com.schoolapp.core.network.dto.activity.ActivityAudienceBodyDto
import com.schoolapp.core.network.dto.activity.ActivityBodyDto
import com.schoolapp.core.network.dto.activity.ActivityDto
import com.schoolapp.core.network.dto.activity.ConsentDto
import com.schoolapp.core.network.dto.activity.ParticipantDto
import com.schoolapp.core.network.dto.activity.ParticipantInputDto
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeParseException

internal fun ActivityDto.toModel(forStudentId: String? = null) = Activity(
    id = id,
    type = enumOrDefault(type, ActivityType.EVENT),
    title = title,
    description = description,
    startAt = startAt,
    endAt = endAt,
    venue = venue,
    status = enumOrDefault(status, ActivityStatus.PROPOSED),
    consentRequired = consentRequired,
    consentDeadline = consentDeadline,
    feeMinor = feeMinor,
    maxParticipants = maxParticipants,
    audienceLabel = audienceLabel ?: audience?.label,
    proposedBy = (proposedBy ?: createdBy)?.name,
    myConsent = enumOrNull<ConsentStatus>(consent?.status ?: consentStatus ?: myConsent)
        ?: if (consentRequired && forStudentId != null) ConsentStatus.PENDING else null,
    studentId = studentId ?: student?.id ?: forStudentId,
    audience = ActivityAudience(
        wholeBranch = audience?.wholeBranch == true,
        classIds = audience?.classIds.orEmpty(),
        sectionIds = audience?.sectionIds.orEmpty(),
    ),
    branchId = branchId,
    reason = reason,
    proposedById = (proposedBy ?: createdBy)?.let { it.id ?: it.userId },
)

/** [forUpdate] leaves out branchId, which PATCH does not accept. */
internal fun ActivityInput.toBody(forUpdate: Boolean = false) = ActivityBodyDto(
    branchId = branchId.takeUnless { forUpdate },
    type = type.name,
    title = title.trim(),
    description = description.trim(),
    startAt = toInstant(startAt),
    endAt = toInstant(endAt),
    venue = venue.clean(),
    audience = if (wholeBranch) {
        ActivityAudienceBodyDto(wholeBranch = true)
    } else {
        ActivityAudienceBodyDto(classIds = classIds, sectionIds = sectionIds, wholeBranch = false)
    },
    consentRequired = consentRequired,
    consentDeadline = consentDeadline?.takeIf { consentRequired },
    feeMinor = feeMinor,
    maxParticipants = maxParticipants,
)

/** Local `yyyy-MM-ddTHH:mm` (school time) -> ISO instant, as the web form sends; other values pass through. */
private fun toInstant(local: String): String = try {
    LocalDateTime.parse(local).atZone(ZoneId.systemDefault()).toInstant().toString()
} catch (e: DateTimeParseException) {
    local
}

internal fun ActivityParticipant.toInput() = ParticipantInputDto(
    studentId = studentId,
    role = role.clean(),
    result = result.clean(),
    position = position,
    remarks = remarks.clean(),
)

internal fun ConsentDto.toModel(): ActivityConsent? {
    val id = student?.id ?: studentId ?: return null
    return ActivityConsent(
        studentId = id,
        studentName = student?.name ?: studentName.orEmpty(),
        guardianName = guardian?.name,
        status = enumOrDefault(status, ConsentStatus.PENDING),
        respondedAt = respondedAt,
    )
}

internal fun ParticipantDto.toModel(): ActivityParticipant? {
    val id = student?.id ?: studentId ?: return null
    return ActivityParticipant(id, student?.name ?: studentName.orEmpty(), role, result, position, remarks)
}

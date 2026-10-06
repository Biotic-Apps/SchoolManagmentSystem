package com.schoolapp.core.data.activities

import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.activity.Activity
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
)

internal fun ActivityInput.toBody() = ActivityBodyDto(
    branchId = branchId,
    type = type.name,
    title = title.trim(),
    description = description.trim(),
    startAt = startAt,
    endAt = endAt,
    venue = venue.clean(),
    audience = if (wholeBranch) ActivityAudienceBodyDto(wholeBranch = true) else ActivityAudienceBodyDto(sectionIds = sectionIds),
    consentRequired = consentRequired,
    consentDeadline = consentDeadline?.takeIf { consentRequired },
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

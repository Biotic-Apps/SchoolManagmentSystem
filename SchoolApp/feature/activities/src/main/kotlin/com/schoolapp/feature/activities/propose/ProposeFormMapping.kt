package com.schoolapp.feature.activities.propose

import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.feature.activities.domain.ActivityTimes
import java.math.BigDecimal
import java.util.Locale

/** Activity -> form (local school time) for editing a proposal. */
internal fun Activity.toForm(): ProposeForm {
    val start = ActivityTimes.toLocal(startAt)
    val end = ActivityTimes.toLocal(endAt)
    return ProposeForm(
        type = type,
        title = title,
        description = description.orEmpty(),
        date = start?.toLocalDate()?.toString(),
        startTime = start?.toLocalTime()?.let { String.format(Locale.ROOT, "%02d:%02d", it.hour, it.minute) },
        endDate = end?.toLocalDate()?.toString()?.takeIf { it != start?.toLocalDate()?.toString() },
        endTime = end?.toLocalTime()?.let { String.format(Locale.ROOT, "%02d:%02d", it.hour, it.minute) },
        venue = venue.orEmpty(),
        wholeBranch = audience.wholeBranch,
        classIds = audience.classIds.toSet(),
        sectionIds = audience.sectionIds.toSet(),
        consentRequired = consentRequired,
        consentDeadline = consentDeadline?.take(DATE_LENGTH),
        fee = feeMinor?.takeIf { it > 0 }?.let { BigDecimal.valueOf(it).movePointLeft(2).stripTrailingZeros().toPlainString() }.orEmpty(),
        maxParticipants = maxParticipants?.toString().orEmpty(),
    )
}

internal fun ProposeForm.toInput(branchId: String?) = ActivityInput(
    branchId = branchId,
    type = type,
    title = title.trim(),
    description = description.trim(),
    startAt = "${date}T$startTime",
    endAt = "${effectiveEndDate}T$endTime",
    venue = venue.trim().ifEmpty { null },
    sectionIds = if (wholeBranch) emptyList() else sectionIds.toList(),
    wholeBranch = wholeBranch,
    consentRequired = consentRequired,
    consentDeadline = consentDeadline.takeIf { consentRequired },
    classIds = if (wholeBranch) emptyList() else classIds.toList(),
    feeMinor = fee.takeIf { it.isNotBlank() }?.let(ProposeValidation::feeMinor),
    maxParticipants = maxParticipants.trim().toIntOrNull(),
)

private const val DATE_LENGTH = 10

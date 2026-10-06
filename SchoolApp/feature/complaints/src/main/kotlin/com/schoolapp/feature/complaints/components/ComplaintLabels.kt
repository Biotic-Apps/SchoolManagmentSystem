package com.schoolapp.feature.complaints.components

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintStatus
import com.schoolapp.feature.complaints.R

@StringRes
internal fun ComplaintCategory.labelRes(): Int = when (this) {
    ComplaintCategory.ACADEMIC -> R.string.complaints_category_academic
    ComplaintCategory.STAFF_BEHAVIOUR -> R.string.complaints_category_staff_behaviour
    ComplaintCategory.FACILITY -> R.string.complaints_category_facility
    ComplaintCategory.TRANSPORT -> R.string.complaints_category_transport
    ComplaintCategory.FEE -> R.string.complaints_category_fee
    ComplaintCategory.SAFETY -> R.string.complaints_category_safety
    ComplaintCategory.OTHER -> R.string.complaints_category_other
}

@StringRes
internal fun ComplaintStatus.labelRes(): Int = when (this) {
    ComplaintStatus.SUBMITTED -> R.string.complaints_status_submitted
    ComplaintStatus.ASSIGNED -> R.string.complaints_status_assigned
    ComplaintStatus.IN_PROGRESS -> R.string.complaints_status_in_progress
    ComplaintStatus.RESOLVED -> R.string.complaints_status_resolved
    ComplaintStatus.CLOSED -> R.string.complaints_status_closed
    ComplaintStatus.ESCALATED -> R.string.complaints_status_escalated
    ComplaintStatus.REOPENED -> R.string.complaints_status_reopened
}

@Composable
internal fun categoryLabel(category: ComplaintCategory): String = stringResource(category.labelRes())

@Composable
internal fun statusLabel(status: ComplaintStatus): String = stringResource(status.labelRes())

internal fun ComplaintStatus.tone(): StatusTone = when (this) {
    ComplaintStatus.SUBMITTED, ComplaintStatus.REOPENED -> StatusTone.Warning
    ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS -> StatusTone.Info
    ComplaintStatus.RESOLVED -> StatusTone.Success
    ComplaintStatus.CLOSED -> StatusTone.Neutral
    ComplaintStatus.ESCALATED -> StatusTone.Error
}

package com.schoolapp.feature.pickup.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.model.pickup.PickupPersonStatus
import com.schoolapp.feature.pickup.R
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeParseException

@Composable
internal fun personStatusLabel(status: PickupPersonStatus): String = stringResource(
    when (status) {
        PickupPersonStatus.PENDING_VERIFICATION -> R.string.pickup_status_pending_verification
        PickupPersonStatus.VERIFIED -> R.string.pickup_status_verified
        PickupPersonStatus.REVOKED -> R.string.pickup_status_revoked
    },
)

internal fun PickupPersonStatus.tone(): StatusTone = when (this) {
    PickupPersonStatus.PENDING_VERIFICATION -> StatusTone.Warning
    PickupPersonStatus.VERIFIED -> StatusTone.Success
    PickupPersonStatus.REVOKED -> StatusTone.Error
}

@Composable
internal fun leaveStatusLabel(status: EarlyLeaveStatus): String = stringResource(
    when (status) {
        EarlyLeaveStatus.REQUESTED -> R.string.pickup_leave_requested
        EarlyLeaveStatus.APPROVED -> R.string.pickup_leave_approved
        EarlyLeaveStatus.REJECTED -> R.string.pickup_leave_rejected
        EarlyLeaveStatus.DEPARTED -> R.string.pickup_leave_departed
    },
)

internal fun EarlyLeaveStatus.tone(): StatusTone = when (this) {
    EarlyLeaveStatus.REQUESTED -> StatusTone.Warning
    EarlyLeaveStatus.APPROVED -> StatusTone.Success
    EarlyLeaveStatus.REJECTED -> StatusTone.Error
    EarlyLeaveStatus.DEPARTED -> StatusTone.Info
}

/** ISO departure instant as a 12-hour clock time in the device zone ("1:05 PM"); null if unparseable. */
internal fun departureTime(at: String?): String? {
    if (at.isNullOrBlank()) return null
    return try {
        TimeFormat.formatTime12(Instant.parse(at).atZone(ZoneId.systemDefault()).toLocalTime())
    } catch (e: DateTimeParseException) {
        null
    }
}

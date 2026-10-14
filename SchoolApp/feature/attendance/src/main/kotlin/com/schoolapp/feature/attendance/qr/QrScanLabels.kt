package com.schoolapp.feature.attendance.qr

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material.icons.outlined.HighlightOff
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.common.time.TimeFormat
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.attendance.QrPersonType
import com.schoolapp.core.model.attendance.QrScanOutcome
import com.schoolapp.feature.attendance.R
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeParseException

@Composable
@ReadOnlyComposable
internal fun qrOutcomeLabel(outcome: QrScanOutcome): String = stringResource(
    when (outcome) {
        QrScanOutcome.MARKED -> R.string.qr_result_marked
        QrScanOutcome.ALREADY_MARKED -> R.string.qr_result_already
        QrScanOutcome.NOT_FOUND -> R.string.qr_result_not_found
        QrScanOutcome.OUTSIDE_HOURS -> R.string.qr_result_outside
    },
)

internal fun QrScanOutcome.tone(): StatusTone = when (this) {
    QrScanOutcome.MARKED -> StatusTone.Success
    QrScanOutcome.ALREADY_MARKED -> StatusTone.Warning
    QrScanOutcome.NOT_FOUND, QrScanOutcome.OUTSIDE_HOURS -> StatusTone.Error
}

internal fun QrScanOutcome.icon(): ImageVector = when (this) {
    QrScanOutcome.MARKED -> Icons.Outlined.CheckCircle
    QrScanOutcome.ALREADY_MARKED -> Icons.Outlined.Schedule
    QrScanOutcome.NOT_FOUND -> Icons.Outlined.HighlightOff
    QrScanOutcome.OUTSIDE_HOURS -> Icons.Outlined.ErrorOutline
}

@Composable
@ReadOnlyComposable
internal fun qrPersonLabel(type: QrPersonType?): String? = type?.let {
    stringResource(if (it == QrPersonType.STUDENT) R.string.qr_type_student else R.string.qr_type_staff)
}

/** ISO instant as a 12-hour clock time in the device zone ("9:05 AM"). */
internal fun scanTime(iso: String): String? = try {
    TimeFormat.formatTime12(Instant.parse(iso).atZone(ZoneId.systemDefault()).toLocalTime())
} catch (e: DateTimeParseException) {
    null
}

package com.schoolapp.feature.attendance.qr

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.QrScanResult
import com.schoolapp.feature.attendance.R

/** Outcome of the last scan: photo, outcome chip, who it was (class or designation, number) and the time. */
@Composable
internal fun QrResultCard(result: QrScanResult, modifier: Modifier = Modifier) {
    val name = result.name ?: stringResource(R.string.qr_unknown)
    AppCard(modifier.fillMaxWidth(), tone = result.outcome.tone().takeIf { it == StatusTone.Error }) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            PersonAvatar(name = name, photoUrl = result.photoUrl, size = 64.dp)
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    StatusChip(qrOutcomeLabel(result.outcome), result.outcome.tone(), icon = result.outcome.icon())
                    qrPersonLabel(result.personType)?.let { StatusChip(it, StatusTone.Neutral) }
                }
                Text(name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
                val details = listOfNotNull(
                    result.classLabel,
                    result.designation,
                    result.admissionNo?.let { stringResource(R.string.qr_admission_no, it) },
                    result.employeeNo?.let { stringResource(R.string.qr_employee_no, it) },
                    scanTime(result.timestamp),
                )
                if (details.isNotEmpty()) {
                    Text(details.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
    }
}

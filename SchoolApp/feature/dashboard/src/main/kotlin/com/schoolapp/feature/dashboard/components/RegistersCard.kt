package com.schoolapp.feature.dashboard.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.FactCheck
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.feature.dashboard.R
import com.schoolapp.feature.dashboard.teacher.RegisterRow

/** Today's register per section; tapping opens the register for marking. */
@Composable
internal fun RegistersCard(registers: List<RegisterRow>, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.dashboard_attendance_title))
        if (registers.isEmpty()) {
            Text(
                stringResource(R.string.dashboard_no_registers),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
        }
        registers.forEach { register ->
            val (label, tone) = registerChip(register.status)
            ListItemRow(
                title = register.label ?: stringResource(R.string.dashboard_section_unknown),
                leadingIcon = Icons.AutoMirrored.Outlined.FactCheck,
                onClick = { onOpen(register.destination) },
                trailing = { StatusChip(stringResource(label), tone) },
            )
        }
    }
}

private fun registerChip(status: RegisterStatus): Pair<Int, StatusTone> = when (status) {
    RegisterStatus.UNMARKED -> R.string.dashboard_register_unmarked to StatusTone.Warning
    RegisterStatus.DRAFT -> R.string.dashboard_register_draft to StatusTone.Info
    RegisterStatus.SUBMITTED -> R.string.dashboard_register_submitted to StatusTone.Success
    RegisterStatus.LOCKED -> R.string.dashboard_register_locked to StatusTone.Neutral
    RegisterStatus.PENDING_REVIEW -> R.string.dashboard_register_pending_review to StatusTone.Warning
}

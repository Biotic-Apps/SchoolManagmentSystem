package com.schoolapp.feature.admin.schools.setup.steps

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.formatTime
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.schools.setup.SetupFormEdits
import com.schoolapp.feature.admin.schools.setup.SetupUiState
import com.schoolapp.feature.admin.schools.setup.components.SetupPanel
import com.schoolapp.feature.admin.schools.setup.components.StepperRow
import com.schoolapp.feature.admin.schools.setup.components.TimeField
import com.schoolapp.feature.admin.schools.setup.components.setupErrorText
import com.schoolapp.feature.admin.schools.setup.model.BellGenerator
import com.schoolapp.feature.admin.schools.setup.model.BellRow
import com.schoolapp.feature.admin.schools.setup.model.SetupKeys

/** Period times for every day with an optional shorter Friday, previewed live (web BellStep). */
@Composable
internal fun BellStep(state: SetupUiState, edits: SetupFormEdits, modifier: Modifier = Modifier) {
    val bell = state.form.bell
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        SetupPanel(stringResource(R.string.setup_panel_every_day)) {
            TimeField(
                stringResource(R.string.setup_first_period), bell.startTime, { v -> edits.bell { it.copy(startTime = v) } },
                error = setupErrorText(state.error(SetupKeys.BELL_START)),
            )
            StepperRow(stringResource(R.string.setup_period_length), bell.periodMinutes, { v -> edits.bell { it.copy(periodMinutes = v) } }, 10, 120)
            StepperRow(stringResource(R.string.setup_periods_per_day), bell.periodsPerDay, { v -> edits.bell { it.copy(periodsPerDay = v) } }, 1, 12)
            StepperRow(
                stringResource(R.string.setup_break_after), bell.breakAfter, { v -> edits.bell { it.copy(breakAfter = v) } }, 0, 11,
                hint = stringResource(R.string.setup_break_after_hint),
                error = setupErrorText(state.error(SetupKeys.BREAK_AFTER)),
            )
            StepperRow(stringResource(R.string.setup_break_length), bell.breakMinutes, { v -> edits.bell { it.copy(breakMinutes = v) } }, 0, 90)
            BellPreview(stringResource(R.string.setup_preview), BellGenerator.everyDay(bell))
        }
        if (state.form.fridayWorks) {
            SetupPanel(stringResource(R.string.setup_panel_friday)) {
                SwitchRow(
                    title = stringResource(R.string.setup_short_friday),
                    supporting = stringResource(R.string.setup_short_friday_hint),
                    checked = bell.shortFriday,
                    onCheckedChange = { v -> edits.bell { it.copy(shortFriday = v) } },
                )
                if (bell.shortFriday) {
                    val friday = bell.friday
                    StepperRow(
                        stringResource(R.string.setup_period_length), friday.periodMinutes,
                        { v -> edits.bell { it.copy(friday = it.friday.copy(periodMinutes = v)) } }, 10, 120,
                    )
                    StepperRow(
                        stringResource(R.string.setup_periods), friday.periodsPerDay,
                        { v -> edits.bell { it.copy(friday = it.friday.copy(periodsPerDay = v)) } }, 1, 12,
                    )
                    StepperRow(
                        stringResource(R.string.setup_break_length), friday.breakMinutes,
                        { v -> edits.bell { it.copy(friday = it.friday.copy(breakMinutes = v)) } }, 0, 90,
                    )
                    BellPreview(stringResource(R.string.setup_friday_preview), BellGenerator.friday(bell))
                }
            }
        }
    }
}

@Composable
private fun BellPreview(title: String, rows: List<BellRow>) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(title, style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
        rows.forEach { row ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(
                    if (row.isBreak) stringResource(R.string.setup_break) else stringResource(R.string.setup_period_n, row.period),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (row.isBreak) FontWeight.SemiBold else FontWeight.Normal,
                    color = if (row.isBreak) AppColors.Primary else AppColors.TextPrimary,
                )
                Text(
                    "${formatTime(row.startTime)} – ${formatTime(row.endTime)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                )
            }
        }
    }
}

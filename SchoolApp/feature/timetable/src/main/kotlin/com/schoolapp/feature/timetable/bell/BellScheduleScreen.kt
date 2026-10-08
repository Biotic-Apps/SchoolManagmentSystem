package com.schoolapp.feature.timetable.bell

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.timetable.R
import com.schoolapp.feature.timetable.builder.dayNameRes
import com.schoolapp.feature.timetable.builder.timeRange

/** Bell schedule: day chips (all days / own-time variants), the rows, Generate…, Save with the PERIODS_IN_USE confirm. */
@Composable
internal fun BellScheduleScreen(state: BellUiState, viewModel: BellScheduleViewModel, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.schedules.isEmpty() -> ErrorState(appErrorMessage(state.loadError ?: AppError.Unknown()), modifier, onRetry = viewModel::load)
        else -> ScreenColumn(modifier, contentPadding = PaddingValues(16.dp)) {
            item { DayChips(state, viewModel) }
            item {
                Text(stringResource(R.string.tt_bell_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
            }
            val schedule = state.current ?: return@ScreenColumn
            if (state.canEdit) {
                itemsIndexed(schedule.rows) { index, row ->
                    BellRowCard(index, numberOf(schedule.rows, index), row, state.problems[index], viewModel)
                }
                item { EditActions(state, viewModel) }
            } else {
                itemsIndexed(schedule.rows) { index, row ->
                    val title = if (row.isBreak) row.label else stringResource(R.string.tt_period_n, numberOf(schedule.rows, index) ?: 0)
                    Text("$title · ${timeRange(com.schoolapp.core.model.timetable.Period(index, row.startTime, row.endTime, row.isBreak, null))}")
                }
            }
        }
    }
    state.generator?.let { GeneratorSheet(it, viewModel) }
    state.lessonsToDrop?.let { lessons ->
        ConfirmDialog(
            title = stringResource(R.string.tt_drop_title),
            message = (listOf(stringResource(R.string.tt_drop_message)) + lessons.map { "• $it" }).joinToString("\n"),
            confirmLabel = stringResource(R.string.tt_drop_confirm),
            onConfirm = { viewModel.save(dropLessons = true) },
            onDismiss = viewModel::dismissDrop,
            destructive = true,
        )
    }
}

@Composable
private fun DayChips(state: BellUiState, viewModel: BellScheduleViewModel) {
    var menu by rememberSaveable { mutableStateOf(false) }
    Row(verticalAlignment = Alignment.CenterVertically) {
        FilterChipRow(
            options = state.schedules.map {
                SwitcherOption(it.day.toString(), if (it.day == 0) stringResource(R.string.tt_all_days) else stringResource(dayNameRes(it.day)))
            },
            selectedId = (state.current?.day ?: 0).toString(),
            onSelect = { viewModel.selectDay(it.toInt()) },
            modifier = Modifier.weight(1f),
        )
        val day = state.current?.day ?: 0
        if (state.canEdit && day != 0) {
            IconButton(onClick = { viewModel.removeVariant(day) }) {
                Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.tt_remove_variant, stringResource(dayNameRes(day))))
            }
        }
        if (state.canEdit && state.variantCandidates.isNotEmpty()) {
            Row {
                IconButton(onClick = { menu = true }) { Icon(Icons.Outlined.Add, contentDescription = stringResource(R.string.tt_add_variant)) }
                DropdownMenu(expanded = menu, onDismissRequest = { menu = false }) {
                    state.variantCandidates.forEach { candidate ->
                        DropdownMenuItem(
                            text = { Text(stringResource(R.string.tt_own_times, stringResource(dayNameRes(candidate)))) },
                            onClick = {
                                menu = false
                                viewModel.addVariant(candidate)
                            },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EditActions(state: BellUiState, viewModel: BellScheduleViewModel) {
    androidx.compose.foundation.layout.Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.emptySchedule) InlineMessage(stringResource(R.string.tt_add_one_period), StatusTone.Error)
        state.error?.let { InlineMessage(actionErrorMessage(it.error, it.details), StatusTone.Error) }
        if (state.saved && !state.dirty) InlineMessage(stringResource(R.string.tt_bell_saved), StatusTone.Success)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            SecondaryButton(stringResource(R.string.tt_add_period), onClick = viewModel::addRow, leadingIcon = Icons.Outlined.Add)
            AppTextButton(stringResource(R.string.tt_generate), onClick = viewModel::openGenerator, leadingIcon = Icons.Outlined.AutoAwesome)
        }
        PrimaryButton(
            stringResource(R.string.tt_save_bell),
            onClick = { viewModel.save() },
            enabled = state.dirty,
            loading = state.saving,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

/** "Period N" among the teaching rows; null for breaks. */
internal fun numberOf(rows: List<BellRow>, index: Int): Int? =
    if (rows[index].isBreak) null else rows.take(index + 1).count { !it.isBreak }

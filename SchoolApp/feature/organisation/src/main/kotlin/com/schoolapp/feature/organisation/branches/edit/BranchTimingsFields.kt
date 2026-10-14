package com.schoolapp.feature.organisation.branches.edit

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.TimeInput

/** Students' day, teachers' day, attendance lock and working days (shared by add/edit and principal timings). */
@Composable
internal fun BranchTimingsFields(form: BranchForm, editor: BranchEditor) {
    @Composable
    fun message(field: BranchField): String? = form.errors[field]?.let { stringResource(it) }

    TimePair(
        first = { m ->
            TimeInput(form.opensAt, stringResource(R.string.org_branch_opens), { v ->
                editor.editForm(BranchField.OPENS) { it.copy(opensAt = v) }
            }, m, message(BranchField.OPENS))
        },
        second = { m ->
            TimeInput(form.closesAt, stringResource(R.string.org_branch_closes), { v ->
                editor.editForm(BranchField.CLOSES) { it.copy(closesAt = v) }
            }, m, message(BranchField.CLOSES))
        },
    )
    TimePair(
        first = { m ->
            TimeInput(form.staffArrivesAt, stringResource(R.string.org_branch_staff_arrive), { v ->
                editor.editForm(BranchField.STAFF_ARRIVE) { it.copy(staffArrivesAt = v) }
            }, m, message(BranchField.STAFF_ARRIVE))
        },
        second = { m ->
            TimeInput(form.staffLeavesAt, stringResource(R.string.org_branch_staff_leave), { v ->
                editor.editForm(BranchField.STAFF_LEAVE) { it.copy(staffLeavesAt = v) }
            }, m, message(BranchField.STAFF_LEAVE))
        },
    )
    TimeInput(
        form.attendanceLockAt, stringResource(R.string.org_branch_attendance_lock),
        { v -> editor.editForm(BranchField.LOCK) { it.copy(attendanceLockAt = v) } },
        Modifier.fillMaxWidth(), message(BranchField.LOCK),
    )
    WorkingDaysPicker(
        selected = form.workingDays,
        onToggle = { day ->
            editor.editForm(BranchField.DAYS) { it.copy(workingDays = if (day in it.workingDays) it.workingDays - day else it.workingDays + day) }
        },
        errorText = message(BranchField.DAYS),
    )
}

@Composable
private fun TimePair(first: @Composable (Modifier) -> Unit, second: @Composable (Modifier) -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        first(Modifier.weight(1f))
        second(Modifier.weight(1f))
    }
}

/** ISO weekdays 1 (Mon) … 7 (Sun) as toggle chips. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun WorkingDaysPicker(selected: Set<Int>, onToggle: (Int) -> Unit, errorText: String?) {
    val names = stringArrayResource(R.array.org_week_days)
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(stringResource(R.string.org_branch_working_days), style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            names.forEachIndexed { index, name ->
                val day = index + 1
                FilterChip(
                    selected = day in selected,
                    onClick = { onToggle(day) },
                    label = { Text(name) },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = AppColors.Surface,
                        labelColor = AppColors.TextPrimary,
                        selectedContainerColor = AppColors.Selected,
                        selectedLabelColor = AppColors.Primary,
                    ),
                )
            }
        }
        errorText?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
    }
}

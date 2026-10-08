package com.schoolapp.feature.attendance.staffmark

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.Business
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.ScopePicker
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.AttendanceDateField
import com.schoolapp.feature.attendance.register.components.RegisterHeader
import com.schoolapp.feature.attendance.staffmark.components.StaffMarkRow

/** Callbacks of the staff register body. */
internal class StaffMarkActions(
    val onRetry: () -> Unit,
    val onBranchSelected: (String) -> Unit,
    val onDateSelected: (String) -> Unit,
    val onStatusSelected: (String, AttendanceStatus) -> Unit,
    val onMarkAllPresent: () -> Unit,
    val onEditDetails: (String) -> Unit,
)

@Composable
internal fun StaffMarkScreen(state: StaffMarkUiState, actions: StaffMarkActions, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.entries.isEmpty() -> PullableState(modifier) { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
        state.branchId == null -> PullableState(modifier) { EmptyState(stringResource(R.string.attendance_staff_no_branch), icon = Icons.Outlined.Business) }
        else -> ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 24.dp)) {
            if (state.showBranchPicker) {
                item(key = "branch") {
                    ScopePicker(state.branches.map { SwitcherOption(it.id, it.name) }, state.branchId, actions.onBranchSelected)
                }
            }
            item(key = "date") { AttendanceDateField(state.date, state.today, actions.onDateSelected) }
            state.message?.let { item(key = "message") { InlineMessage(stringResource(R.string.attendance_staff_saved), StatusTone.Success) } }
            state.error?.let { error -> item(key = "load_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            state.actionError?.let { error -> item(key = "action_error") { InlineMessage(appErrorMessage(error), StatusTone.Error) } }
            val rows = state.rows
            if (rows.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        stringResource(R.string.attendance_staff_empty),
                        message = stringResource(R.string.attendance_staff_empty_message),
                        icon = Icons.Outlined.Badge,
                    )
                }
            } else {
                item(key = "header") {
                    RegisterHeader(state.counts, editable = state.counts.unmarked > 0 && !state.isSaving, onMarkAllPresent = actions.onMarkAllPresent)
                }
                items(rows, key = { it.staffId }) { row ->
                    StaffMarkRow(
                        row = row,
                        enabled = !state.isSaving,
                        onSelect = { actions.onStatusSelected(row.staffId, it) },
                        onEditDetails = { actions.onEditDetails(row.staffId) },
                    )
                }
            }
        }
    }
}

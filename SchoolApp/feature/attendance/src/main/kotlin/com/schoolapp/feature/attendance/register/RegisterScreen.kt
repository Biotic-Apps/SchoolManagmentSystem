package com.schoolapp.feature.attendance.register

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.RegisterStatus
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.register.components.RegisterHeader
import com.schoolapp.feature.attendance.register.components.RosterRow
import com.schoolapp.feature.attendance.register.components.registerBanners

/** Callbacks of the register body, grouped to keep the composable signature readable. */
internal class RegisterActions(
    val onRetry: () -> Unit,
    val onRowTap: (String) -> Unit,
    val onStatusSelected: (String, AttendanceStatus) -> Unit,
    val onMarkAllPresent: () -> Unit,
    val onAlertClick: (String) -> Unit,
    val onShowServerRegister: () -> Unit,
    val onToggleCompare: () -> Unit,
    val onDiscardMine: () -> Unit,
)

@Composable
internal fun RegisterScreen(state: RegisterUiState, actions: RegisterActions, modifier: Modifier = Modifier) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && state.register == null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = actions.onRetry)
        else -> {
            val editable = !state.isReadOnly
            val canCorrect = state.status == RegisterStatus.LOCKED && state.canRequestCorrection
            val entries = state.entries
            ScreenColumn(modifier, contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = 24.dp)) {
                registerBanners(state, actions.onShowServerRegister, actions.onToggleCompare, actions.onDiscardMine)
                if (entries.isEmpty()) {
                    item(key = "empty") { EmptyState(stringResource(R.string.attendance_roster_empty), icon = Icons.Outlined.Groups) }
                } else {
                    item(key = "header") { RegisterHeader(state.counts, editable, actions.onMarkAllPresent) }
                    items(entries, key = { it.studentId }) { entry ->
                        RosterRow(
                            entry = entry,
                            editable = editable,
                            onClick = when {
                                editable -> { { actions.onRowTap(entry.studentId) } }
                                canCorrect && entry.entryId != null -> { { actions.onRowTap(entry.studentId) } }
                                else -> null
                            },
                            onSelect = { actions.onStatusSelected(entry.studentId, it) },
                            onAlertClick = { actions.onAlertClick(entry.studentId) },
                        )
                    }
                }
            }
        }
    }
}

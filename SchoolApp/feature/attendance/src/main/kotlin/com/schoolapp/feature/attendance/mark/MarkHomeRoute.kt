package com.schoolapp.feature.attendance.mark

import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.navigation.AttendanceRegisterDestination
import com.schoolapp.core.navigation.LeaveReviewDestination
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.attendance.R
import com.schoolapp.feature.attendance.components.AttendanceDateField
import com.schoolapp.feature.attendance.components.LeaveReviewEntry
import com.schoolapp.feature.attendance.mark.components.SectionRegisterCard
import com.schoolapp.feature.attendance.qr.QrScanEntry
import com.schoolapp.feature.attendance.qr.QrScanScreen
import com.schoolapp.feature.attendance.qr.QrScanViewModel

@Composable
internal fun MarkHomeRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MarkHomeViewModel = hiltViewModel(),
    qrViewModel: QrScanViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val qr by qrViewModel.uiState.collectAsStateWithLifecycle()
    var scanning by rememberSaveable { mutableStateOf(false) }
    LifecycleResumeEffect(viewModel) {
        viewModel.refreshStatuses()
        onPauseOrDispose { }
    }
    MarkHomeScreen(
        state = state,
        onDateSelected = viewModel::onDateSelected,
        onRetry = viewModel::load,
        onSectionClick = { row -> onOpen(AttendanceRegisterDestination(row.sectionId, state.date, row.title)) },
        onLeaveReview = { onOpen(LeaveReviewDestination) },
        onQrScan = if (qr.canScan) ({ scanning = true }) else null,
        modifier = modifier,
    )
    if (scanning) QrScanScreen(qrViewModel, onDismiss = { scanning = false })
}

@Composable
internal fun MarkHomeScreen(
    state: MarkHomeUiState,
    onDateSelected: (String) -> Unit,
    onRetry: () -> Unit,
    onSectionClick: (SectionRegisterRow) -> Unit,
    onLeaveReview: () -> Unit,
    modifier: Modifier = Modifier,
    onQrScan: (() -> Unit)? = null,
) {
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            item(key = "date") { AttendanceDateField(state.date, state.today, onDateSelected) }
            if (state.showLeaveReview) item(key = "leave") { LeaveReviewEntry(onLeaveReview) }
            onQrScan?.let { item(key = "qr") { QrScanEntry(it) } }
            item(key = "sections_header") { SectionHeader(title = stringResource(R.string.attendance_your_sections)) }
            if (state.sections.isEmpty()) {
                item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.attendance_no_sections),
                        message = stringResource(R.string.attendance_no_sections_message),
                        icon = Icons.Outlined.Groups,
                    )
                }
            } else {
                items(state.sections, key = { it.sectionId }) { row -> SectionRegisterCard(row, onClick = { onSectionClick(row) }) }
            }
        }
    }
}

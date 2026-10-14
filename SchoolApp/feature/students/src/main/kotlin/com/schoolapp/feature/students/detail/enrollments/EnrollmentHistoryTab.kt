package com.schoolapp.feature.students.detail.enrollments

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.History
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PullableState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.students.detail.EnrollmentHistoryItem
import com.schoolapp.core.ui.formatDate
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.core.ui.statusTone
import com.schoolapp.feature.students.R

/** Enrollment history tab (web EnrollmentHistoryTab): session, branch, class, roll, dates, status and reason. */
@Composable
internal fun EnrollmentHistoryTab(studentId: String, modifier: Modifier = Modifier) {
    val viewModel: EnrollmentHistoryViewModel = hiltViewModel()
    LaunchedEffect(studentId) { viewModel.start(studentId) }
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val error = state.error
    when {
        state.isLoading -> LoadingState(modifier)
        error != null && state.items.isEmpty() -> ErrorState(loadErrorMessage(error), modifier, onRetry = { viewModel.load() })
        else -> RefreshBox(state.isRefreshing, { viewModel.load(refresh = true) }, modifier.fillMaxSize()) {
            if (state.items.isEmpty()) {
                PullableState { EmptyState(title = stringResource(R.string.sd_enroll_empty), icon = Icons.Outlined.History) }
            } else {
                ScreenColumn {
                    items(state.items.size, key = { state.items[it].enrollment.id }) { index -> EnrollmentHistoryCard(state.items[index]) }
                }
            }
        }
    }
}

@Composable
private fun EnrollmentHistoryCard(item: EnrollmentHistoryItem) {
    val e = item.enrollment
    AppCard(Modifier.fillMaxWidth()) {
        SectionHeader(
            title = e.sessionName ?: stringResource(R.string.sd_enroll_session_unknown),
            action = e.status?.let { status -> { StatusChip(humanizeKey(status), statusTone(status)) } },
        )
        KeyValueRow(stringResource(R.string.students_branch), e.branchName)
        KeyValueRow(stringResource(R.string.students_class), listOfNotNull(e.className, e.sectionName).joinToString(" · ").ifBlank { null })
        KeyValueRow(stringResource(R.string.students_roll), e.rollNo?.toString())
        val start = formatDate(e.startDate) ?: "—"
        val end = formatDate(e.endDate) ?: stringResource(R.string.sd_enroll_present)
        KeyValueRow(stringResource(R.string.sd_enroll_dates), "$start – $end")
        item.reason?.let {
            Text(stringResource(R.string.sd_enroll_reason, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

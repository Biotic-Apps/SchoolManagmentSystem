package com.schoolapp.feature.complaints.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ReportProblem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.complaints.R
import com.schoolapp.feature.complaints.components.StatusTimeline
import com.schoolapp.feature.complaints.detail.components.ComplaintActions
import com.schoolapp.feature.complaints.detail.components.ComplaintHeaderCard
import com.schoolapp.feature.complaints.detail.components.ComplaintPeopleCard

@Composable
internal fun ComplaintDetailScreen(
    state: ComplaintDetailUiState,
    onRetry: () -> Unit,
    onAddUpdate: () -> Unit,
    onReasonAction: (ReasonAction) -> Unit,
    modifier: Modifier = Modifier,
) {
    val detail = state.detail
    when {
        state.isLoading -> LoadingState(modifier)
        state.error != null && detail == null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        detail == null -> EmptyState(stringResource(R.string.complaints_not_found), modifier, icon = Icons.Outlined.ReportProblem)
        else -> ScreenColumn(modifier) {
            item(key = "header") { ComplaintHeaderCard(detail.complaint) }
            if (detail.hasActions) {
                item(key = "actions") { ComplaintActions(detail, onAddUpdate, onReasonAction) }
            }
            item(key = "people") { ComplaintPeopleCard(detail) }
            item(key = "timeline") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SectionHeader(stringResource(R.string.complaints_timeline))
                    AppCard {
                        if (detail.complaint.updates.isEmpty()) {
                            Text(stringResource(R.string.complaints_no_updates), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
                        } else {
                            StatusTimeline(detail.complaint.updates)
                        }
                    }
                }
            }
        }
    }
}

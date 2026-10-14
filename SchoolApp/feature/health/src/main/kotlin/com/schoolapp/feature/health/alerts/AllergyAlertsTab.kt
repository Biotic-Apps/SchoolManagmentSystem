package com.schoolapp.feature.health.alerts

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.health.R

/** Section picker plus the students in that section with allergies or medical instructions. */
@Composable
internal fun AllergyAlertsTab(
    onOpenStudent: (String) -> Unit,
    bottomPadding: Dp,
    viewModel: AllergyAlertsViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val error = state.error
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = viewModel::refresh) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottomPadding), itemSpacing = 12.dp) {
            if (state.branches.isNotEmpty()) item(key = "branches") {
                FilterChipRow(state.branches.map { SwitcherOption(it.id, it.name) }, state.branchId, viewModel::onBranchSelected)
            }
            if (state.sections.isNotEmpty()) item(key = "sections") {
                FilterChipRow(state.sections.map { SwitcherOption(it.id, sectionLabel(it)) }, state.sectionId, viewModel::onSectionSelected)
            }
            when {
                state.isLoading || state.isAlertsLoading -> item(key = "loading") { LoadingState() }
                error != null -> item(key = "error") { ErrorState(appErrorMessage(error), onRetry = viewModel::refresh) }
                state.sectionId == null -> item(key = "no_section") {
                    EmptyState(
                        title = stringResource(R.string.health_alerts_no_section),
                        message = stringResource(R.string.health_alerts_no_section_message),
                        icon = Icons.Outlined.HealthAndSafety,
                    )
                }
                state.alerts.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.health_alerts_empty),
                        message = stringResource(R.string.health_alerts_empty_message),
                        icon = Icons.Outlined.HealthAndSafety,
                    )
                }
                else -> items(state.alerts.size, key = { state.alerts[it].studentId }) { index ->
                    val alert = state.alerts[index]
                    StudentAlertCard(alert, onOpen = { onOpenStudent(alert.studentId) })
                }
            }
        }
    }
}

@Composable
private fun sectionLabel(section: Section): String =
    section.className?.let { stringResource(R.string.health_section_label, it, section.name) } ?: section.name

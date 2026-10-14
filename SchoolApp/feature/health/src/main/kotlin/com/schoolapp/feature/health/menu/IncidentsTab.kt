package com.schoolapp.feature.health.menu

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.health.Incident
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.components.IncidentCard

internal class IncidentsTabActions(
    val onRetry: () -> Unit,
    val onLoadMore: () -> Unit,
    val onFromChange: (String) -> Unit,
    val onToChange: (String) -> Unit,
    val onClose: (Incident) -> Unit,
)

/** Date-ranged, paged incidents list; the range bar stays visible in every state. */
@Composable
internal fun IncidentsTab(state: HealthMenuUiState, actions: IncidentsTabActions, bottomPadding: Dp) {
    RefreshBox(isRefreshing = state.isRefreshing, onRefresh = actions.onRetry) {
        ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = bottomPadding)) {
            item(key = "range") {
                IncidentRangeBar(state.from, state.to, state.today, actions.onFromChange, actions.onToChange)
            }
            state.actionError?.let { item(key = "action_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(appErrorMessage(state.error), onRetry = actions.onRetry) }
                state.incidents.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        title = stringResource(R.string.health_incidents_empty),
                        message = stringResource(R.string.health_incidents_empty_message),
                        icon = Icons.Outlined.HealthAndSafety,
                    )
                }
                else -> {
                    items(state.incidents.size, key = { state.incidents[it].id }) { index ->
                        val incident = state.incidents[index]
                        IncidentCard(
                            incident = incident,
                            closing = state.closingId == incident.id,
                            onClose = if (state.canClose) ({ actions.onClose(incident) }) else null,
                        )
                    }
                    state.moreError?.let { item(key = "more_error") { InlineMessage(appErrorMessage(it), StatusTone.Error) } }
                    if (state.hasMore) item(key = "more") {
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            AppTextButton(stringResource(R.string.health_load_more), actions.onLoadMore, loading = state.isLoadingMore)
                        }
                    }
                }
            }
        }
    }
}

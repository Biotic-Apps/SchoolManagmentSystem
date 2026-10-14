package com.schoolapp.feature.health.menu

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.MedicalServices
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.navigation.HealthCardDestination
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.ReportIncidentDestination
import com.schoolapp.feature.health.alerts.AllergyAlertsTab
import com.schoolapp.feature.health.components.studentSearchItems

@Composable
internal fun HealthMenuRoute(
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: HealthMenuViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SecureWindowEffect()
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            AppTabs(
                titles = listOf(
                    stringResource(R.string.health_tab_incidents),
                    stringResource(R.string.health_tab_alerts),
                    stringResource(R.string.health_tab_students),
                ),
                selectedIndex = state.tab.ordinal,
                onSelect = { viewModel.onTabSelected(HealthTab.entries[it]) },
            )
            when (state.tab) {
                HealthTab.INCIDENTS -> IncidentsTab(
                    state = state,
                    actions = IncidentsTabActions(
                        onRetry = viewModel::load,
                        onLoadMore = viewModel::loadMore,
                        onFromChange = viewModel::onFromChange,
                        onToChange = viewModel::onToChange,
                        onClose = viewModel::onCloseRequested,
                    ),
                    bottomPadding = FabSpace,
                )
                HealthTab.ALERTS -> AllergyAlertsTab(onOpenStudent = { onOpen(HealthCardDestination(it)) }, bottomPadding = FabSpace)
                HealthTab.STUDENTS -> ScreenColumn(contentPadding = PaddingValues(start = 16.dp, top = 16.dp, end = 16.dp, bottom = FabSpace)) {
                    studentSearchItems(
                        state = state.search,
                        onQueryChange = viewModel::onQueryChange,
                        onPick = { onOpen(HealthCardDestination(it.id)) },
                        hint = null,
                    )
                }
            }
        }
        AppFloatingButton(
            text = stringResource(R.string.health_report_incident),
            icon = Icons.Outlined.MedicalServices,
            onClick = { onOpen(ReportIncidentDestination()) },
            modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
        )
    }
    state.confirmClose?.let { incident ->
        ConfirmDialog(
            title = stringResource(R.string.health_close_title),
            message = stringResource(R.string.health_close_message, incident.studentName.orEmpty()),
            confirmLabel = stringResource(R.string.health_close_incident),
            onConfirm = viewModel::confirmClose,
            onDismiss = viewModel::onCloseDismissed,
        )
    }
}

private val FabSpace = 88.dp

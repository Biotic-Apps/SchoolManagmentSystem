package com.schoolapp.feature.dashboard

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.dashboard.scope.ScopeActions

/** Role home; [onOpen] navigates to cross-module destinations (registers, diary editor, notices, ...). */
@Composable
fun DashboardRoute(
    onOpenMenu: (String) -> Unit,
    canOpenMenu: (String) -> Boolean,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val challan by viewModel.challan.collectAsStateWithLifecycle()
    val scope by viewModel.scope.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(challan.urlToOpen) {
        challan.urlToOpen?.let {
            viewModel.onChallanOpened()
            external.open(it)
        }
    }
    DashboardScreen(
        state = state,
        onRefresh = viewModel::refresh,
        onOpenMenu = onOpenMenu,
        onOpen = onOpen,
        canOpenMenu = canOpenMenu,
        modifier = modifier,
        challan = challan,
        onDownloadChallan = viewModel::downloadChallan,
        scope = scope,
        scopeActions = ScopeActions(viewModel::onScopeSchool, viewModel::onScopeBranch, viewModel::onScopeSession, viewModel::onScopeReset),
    )
}

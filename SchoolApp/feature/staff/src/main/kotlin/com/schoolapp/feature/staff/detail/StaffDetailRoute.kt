package com.schoolapp.feature.staff.detail

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.account.StaffAccountDialogs
import com.schoolapp.feature.staff.account.StaffAccountViewModel
import com.schoolapp.feature.staff.probation.ProbationViewModel

@Composable
fun StaffDetailRoute(
    onBack: () -> Unit,
    onEdit: (String) -> Unit,
    onAssign: (staffId: String, name: String, branchId: String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: StaffDetailViewModel = hiltViewModel(),
    accountViewModel: StaffAccountViewModel = hiltViewModel(),
    probationViewModel: ProbationViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val account by accountViewModel.uiState.collectAsStateWithLifecycle()
    val probation by probationViewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    var tabIndex by rememberSaveable { mutableIntStateOf(0) }
    ProbationSavedSnackbar(probation.savedOn, snackbar, probationViewModel::consumeSaved)
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = state.detail?.summary?.name ?: stringResource(R.string.staff_detail_title),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val body = Modifier.padding(padding)
        val detail = state.detail
        when {
            state.isLoading -> LoadingState(body)
            state.error != null && detail == null -> ErrorState(appErrorMessage(state.error!!), body, onRetry = viewModel::load)
            detail != null -> Column(body.fillMaxSize()) {
                val tabs = StaffDetailTab.entries
                AppTabs(titles = tabs.map { stringResource(it.title) }, selectedIndex = tabIndex, onSelect = { tabIndex = it })
                val s = detail.summary
                val actions = ProfileActions(
                    onEdit = { onEdit(s.id) }.takeIf { state.canEdit },
                    onStatus = viewModel::openStatusChange.takeIf { state.canChangeStatus },
                    onProbation = { probationViewModel.open(detail) }.takeIf { probation.canSet },
                    onAssign = { onAssign(s.id, s.name, s.branchId.orEmpty()) }.takeIf { state.canAssign },
                    onCreateAccount = { accountViewModel.openCreate(detail) },
                    onResetPassword = accountViewModel::askReset,
                )
                StaffDetailTabContent(tabs[tabIndex], state, account, actions, snackbar, Modifier.weight(1f))
            }
        }
    }
    state.detail?.let { d ->
        StaffAccountDialogs(d.summary.name, d.email ?: d.phone, account, accountViewModel)
        StaffDetailSheets(d, state, probation, viewModel, probationViewModel)
    }
}

@Composable
private fun ProbationSavedSnackbar(savedOn: Boolean?, snackbar: SnackbarHostState, consume: () -> Unit) {
    val on = stringResource(R.string.staff_probation_saved_on)
    val off = stringResource(R.string.staff_probation_saved_off)
    LaunchedEffect(savedOn) {
        val value = savedOn ?: return@LaunchedEffect
        consume()
        snackbar.showSnackbar(if (value) on else off)
    }
}

package com.schoolapp.feature.accounts.menu

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.accounts.R
import com.schoolapp.feature.accounts.categories.IncomeCategoriesViewModel
import com.schoolapp.feature.accounts.income.IncomeListViewModel
import com.schoolapp.feature.accounts.income.form.IncomeFormViewModel
import com.schoolapp.feature.accounts.profitloss.ProfitLossViewModel

/** Accounts: branch picker, Other Income / Income Categories / Profit & Loss tabs and the add action of each tab. */
@Composable
internal fun AccountsMenuRoute(roleKey: String, modifier: Modifier = Modifier) {
    val viewModel: AccountsMenuViewModel = hiltViewModel(key = "accounts_menu_$roleKey")
    val models = AccountsTabViewModels(
        income = hiltViewModel<IncomeListViewModel>(key = "accounts_income_$roleKey"),
        form = hiltViewModel<IncomeFormViewModel>(key = "accounts_income_form_$roleKey"),
        categories = hiltViewModel<IncomeCategoriesViewModel>(key = "accounts_categories_$roleKey"),
        profitLoss = hiltViewModel<ProfitLossViewModel>(key = "accounts_profit_loss_$roleKey"),
    )
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val branch = state.selectedBranch
    LaunchedEffect(branch?.id, branch?.schoolId) {
        if (branch == null) return@LaunchedEffect
        models.income.setBranch(branch.id)
        models.categories.setSchool(branch.schoolId)
        models.profitLoss.setBranch(branch.id)
    }
    Box(modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(loadErrorMessage(state.error!!), onRetry = viewModel::load)
            branch == null -> EmptyState(
                title = stringResource(R.string.accounts_no_branch),
                message = stringResource(R.string.accounts_no_branch_message),
                icon = Icons.Outlined.Apartment,
            )
            else -> Column(Modifier.fillMaxSize()) {
                AccountsBranchBar(state.branches, branch.id, viewModel::selectBranch)
                AppTabs(
                    titles = listOf(
                        stringResource(R.string.accounts_tab_income),
                        stringResource(R.string.accounts_tab_categories),
                        stringResource(R.string.accounts_tab_profit_loss),
                    ),
                    selectedIndex = state.tab.ordinal,
                    onSelect = { viewModel.selectTab(AccountsTab.entries[it]) },
                )
                val showFab = state.permissions.canAdd && state.tab != AccountsTab.PROFIT_LOSS
                AccountsTabContent(
                    tab = state.tab,
                    branchId = branch.id,
                    permissions = state.permissions,
                    bottomSpace = PaddingValues(bottom = if (showFab) FabSpace else 0.dp),
                    snackbar = snackbar,
                    models = models,
                )
            }
        }
        if (branch != null && state.permissions.canAdd && state.tab != AccountsTab.PROFIT_LOSS) {
            val isIncome = state.tab == AccountsTab.INCOME
            AppFloatingButton(
                text = stringResource(if (isIncome) R.string.accounts_add_income else R.string.accounts_add_category),
                icon = Icons.Outlined.Add,
                onClick = { if (isIncome) models.form.start(branch.id, null) else models.categories.openForm() },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}

private val FabSpace = 88.dp

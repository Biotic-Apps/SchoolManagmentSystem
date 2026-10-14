package com.schoolapp.feature.expenses.menu

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.categories.CategoriesViewModel
import com.schoolapp.feature.expenses.list.ExpenseListViewModel
import com.schoolapp.feature.expenses.vendors.VendorsViewModel

/** Expenses & Vendors: branch picker, Expenses / Vendors / Categories tabs and the add action of each tab. */
@Composable
internal fun ExpensesMenuRoute(
    roleKey: String,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExpensesMenuViewModel = hiltViewModel(key = "expenses_menu_$roleKey"),
    listViewModel: ExpenseListViewModel = hiltViewModel(key = "expenses_list_$roleKey"),
    vendorsViewModel: VendorsViewModel = hiltViewModel(key = "expenses_vendors_$roleKey"),
    categoriesViewModel: CategoriesViewModel = hiltViewModel(key = "expenses_categories_$roleKey"),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val branch = state.selectedBranch
    LaunchedEffect(branch?.id, branch?.schoolId) {
        if (branch == null) return@LaunchedEffect
        listViewModel.setScope(branch.id, branch.schoolId)
        vendorsViewModel.setSchool(branch.schoolId)
        categoriesViewModel.setSchool(branch.schoolId)
    }
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(listViewModel) {
        // Coming back from the expense form or detail: show the saved / paid / submitted bill.
        if (resumedOnce) listViewModel.refresh()
        resumedOnce = true
        onPauseOrDispose { }
    }
    Box(modifier.fillMaxSize()) {
        when {
            state.isLoading -> LoadingState()
            state.error != null -> ErrorState(loadErrorMessage(state.error!!), onRetry = viewModel::load)
            branch == null -> EmptyState(
                title = stringResource(R.string.expenses_no_branch),
                message = stringResource(R.string.expenses_no_branch_message),
                icon = Icons.Outlined.Apartment,
            )
            else -> Column(Modifier.fillMaxSize()) {
                ExpensesBranchBar(state.branches, branch.id, viewModel::selectBranch)
                AppTabs(
                    titles = listOf(
                        stringResource(R.string.expenses_tab_expenses),
                        stringResource(R.string.expenses_tab_vendors),
                        stringResource(R.string.expenses_tab_categories),
                    ),
                    selectedIndex = state.tab.ordinal,
                    onSelect = { viewModel.selectTab(ExpensesTab.entries[it]) },
                )
                val bottomSpace = PaddingValues(bottom = if (state.permissions.canAdd) FabSpace else 0.dp)
                ExpensesTabContent(
                    tab = state.tab,
                    branchId = branch.id,
                    schoolId = branch.schoolId,
                    permissions = state.permissions,
                    bottomSpace = bottomSpace,
                    onOpen = onOpen,
                    snackbar = snackbar,
                    viewModels = ExpensesTabViewModels(listViewModel, vendorsViewModel, categoriesViewModel),
                )
            }
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}

private val FabSpace = 88.dp

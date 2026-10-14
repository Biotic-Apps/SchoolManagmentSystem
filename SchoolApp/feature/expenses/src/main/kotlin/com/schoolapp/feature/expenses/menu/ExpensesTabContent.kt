package com.schoolapp.feature.expenses.menu

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AddBusiness
import androidx.compose.material.icons.outlined.CreateNewFolder
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.expenses.ExpenseDetailDestination
import com.schoolapp.feature.expenses.ExpenseFormDestination
import com.schoolapp.feature.expenses.R
import com.schoolapp.feature.expenses.categories.CategoriesTab
import com.schoolapp.feature.expenses.categories.CategoriesViewModel
import com.schoolapp.feature.expenses.categories.CategoryFormSheet
import com.schoolapp.feature.expenses.common.ExpensePermissions
import com.schoolapp.feature.expenses.list.ExpenseListActions
import com.schoolapp.feature.expenses.list.ExpenseListViewModel
import com.schoolapp.feature.expenses.list.ExpensesTab as ExpensesListTab
import com.schoolapp.feature.expenses.vendors.VendorFormSheet
import com.schoolapp.feature.expenses.vendors.VendorsActions
import com.schoolapp.feature.expenses.vendors.VendorsTab
import com.schoolapp.feature.expenses.vendors.VendorsViewModel

internal class ExpensesTabViewModels(
    val list: ExpenseListViewModel,
    val vendors: VendorsViewModel,
    val categories: CategoriesViewModel,
)

/** Body of the selected tab, its floating "Add" action and its add sheet. */
@Composable
internal fun ExpensesTabContent(
    tab: ExpensesTab,
    branchId: String,
    schoolId: String?,
    permissions: ExpensePermissions,
    bottomSpace: PaddingValues,
    onOpen: (Any) -> Unit,
    snackbar: SnackbarHostState,
    viewModels: ExpensesTabViewModels,
) {
    val list by viewModels.list.uiState.collectAsStateWithLifecycle()
    val vendors by viewModels.vendors.uiState.collectAsStateWithLifecycle()
    val categories by viewModels.categories.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    val addedTemplate = stringResource(R.string.expenses_added_named)
    LaunchedEffect(vendors.added) {
        val name = vendors.added ?: return@LaunchedEffect
        viewModels.vendors.consumeAdded()
        snackbar.showSnackbar(addedTemplate.format(name))
    }
    LaunchedEffect(categories.added) {
        val name = categories.added ?: return@LaunchedEffect
        viewModels.categories.consumeAdded()
        viewModels.list.refresh()
        snackbar.showSnackbar(addedTemplate.format(name))
    }
    Box(Modifier.fillMaxSize()) {
        when (tab) {
            ExpensesTab.EXPENSES -> ExpensesListTab(
                state = list,
                actions = viewModels.list.let { vm ->
                    ExpenseListActions(
                        onRefresh = vm::refresh,
                        onLoadMore = vm::loadMore,
                        onRetryMore = vm::retryMore,
                        onStatus = vm::setStatus,
                        onOpenFilters = vm::openFilters,
                        onCloseFilters = vm::closeFilters,
                        onApplyFilters = vm::applyFilters,
                        onOpen = { onOpen(ExpenseDetailDestination(it.id, schoolId)) },
                    )
                },
                bottomSpace = bottomSpace,
            )
            ExpensesTab.VENDORS -> VendorsTab(
                state = vendors,
                actions = viewModels.vendors.let { vm ->
                    VendorsActions(
                        onSearch = vm::onSearchChange,
                        onRefresh = vm::refresh,
                        onLoadMore = vm::loadMore,
                        onRetryMore = vm::retryMore,
                        onCall = external::dial,
                        onEmail = { external.open("mailto:$it") },
                    )
                },
                bottomSpace = bottomSpace,
            )
            ExpensesTab.CATEGORIES -> CategoriesTab(categories, viewModels.categories::refresh, bottomSpace)
        }
        if (permissions.canAdd) {
            val fabModifier = Modifier.align(Alignment.BottomEnd).padding(16.dp)
            when (tab) {
                ExpensesTab.EXPENSES -> AppFloatingButton(
                    text = stringResource(R.string.expenses_add_expense),
                    icon = Icons.Outlined.Add,
                    onClick = { onOpen(ExpenseFormDestination(branchId = branchId, schoolId = schoolId)) },
                    modifier = fabModifier,
                )
                ExpensesTab.VENDORS -> AppFloatingButton(
                    text = stringResource(R.string.expenses_add_vendor),
                    icon = Icons.Outlined.AddBusiness,
                    onClick = viewModels.vendors::openForm,
                    modifier = fabModifier,
                )
                ExpensesTab.CATEGORIES -> AppFloatingButton(
                    text = stringResource(R.string.expenses_add_category),
                    icon = Icons.Outlined.CreateNewFolder,
                    onClick = viewModels.categories::openForm,
                    modifier = fabModifier,
                )
            }
        }
    }
    vendors.form?.let { form ->
        VendorFormSheet(form, viewModels.vendors::updateForm, viewModels.vendors::save, viewModels.vendors::closeForm)
    }
    categories.form?.let { form ->
        CategoryFormSheet(
            form = form,
            onNameChange = viewModels.categories::onNameChange,
            onCodeChange = viewModels.categories::onCodeChange,
            onSave = viewModels.categories::save,
            onDismiss = viewModels.categories::closeForm,
        )
    }
}

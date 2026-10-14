package com.schoolapp.feature.accounts.menu

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.ConfirmDialog
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.feature.accounts.R
import com.schoolapp.feature.accounts.common.AccountsPermissions
import com.schoolapp.feature.accounts.common.SnackbarNotice
import com.schoolapp.feature.accounts.income.IncomeChange
import com.schoolapp.feature.accounts.income.IncomeListActions
import com.schoolapp.feature.accounts.income.IncomeTab
import com.schoolapp.feature.accounts.income.components.IncomeDetailSheet
import com.schoolapp.feature.accounts.income.components.IncomeFilterSheet
import com.schoolapp.feature.accounts.income.form.IncomeFormActions
import com.schoolapp.feature.accounts.income.form.IncomeFormSheet

/** Other Income tab with its filter, detail, delete-confirm and record/edit sheets. */
@Composable
internal fun IncomeSection(
    branchId: String,
    permissions: AccountsPermissions,
    bottomSpace: PaddingValues,
    snackbar: SnackbarHostState,
    models: AccountsTabViewModels,
    categories: List<IncomeCategory>,
) {
    val list = models.income
    val form = models.form
    val state by list.uiState.collectAsStateWithLifecycle()
    val formState by form.uiState.collectAsStateWithLifecycle()
    IncomeTab(
        state = state,
        categoryName = { categoryNameOf(it, categories) },
        actions = IncomeListActions(
            onRefresh = list::refresh,
            onLoadMore = list::loadMore,
            onOpenFilters = list::openFilters,
            onOpen = list::open,
        ),
        bottomSpace = bottomSpace,
    )
    if (state.showFilters) {
        IncomeFilterSheet(state.filter, categories, onApply = list::applyFilter, onDismiss = list::closeFilters)
    }
    state.selected?.takeIf { !formState.isOpen }?.let { income ->
        IncomeDetailSheet(
            income = income,
            categoryName = categoryNameOf(income, categories),
            canEdit = permissions.canEdit,
            deleting = state.deletingId == income.id,
            error = state.actionError,
            onEdit = { form.start(branchId, income) },
            onDelete = { list.askDelete(income) },
            onDismiss = list::closeDetail,
        )
    }
    state.confirmDelete?.let { income ->
        ConfirmDialog(
            title = stringResource(R.string.accounts_delete_title),
            message = stringResource(R.string.accounts_delete_message, income.title),
            confirmLabel = stringResource(R.string.accounts_delete),
            onConfirm = list::confirmDelete,
            onDismiss = list::dismissDelete,
            destructive = true,
        )
    }
    if (formState.isOpen) {
        IncomeFormSheet(
            state = formState,
            categories = categories,
            actions = IncomeFormActions(
                onTitle = form::onTitle,
                onCategory = form::onCategory,
                onAmount = form::onAmount,
                onDate = form::onDate,
                onDescription = form::onDescription,
                onNotes = form::onNotes,
                onReceiptPicked = form::onReceiptPicked,
                onReceiptRemoved = form::onReceiptRemoved,
                onSubmit = form::submit,
                onDismiss = form::close,
            ),
        )
    }
    val saved = formState.saved
    LaunchedEffect(saved) {
        if (saved != null) {
            list.onSaved(if (formState.isEdit) IncomeChange.UPDATED else IncomeChange.RECORDED)
            form.consumeSaved()
        }
    }
    SnackbarNotice(incomeChangeText(state.change), snackbar, list::consumeChange)
}

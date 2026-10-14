package com.schoolapp.feature.expenses.form

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.expenses.R

@Composable
internal fun ExpenseFormRoute(
    onBack: () -> Unit,
    onCreated: (expenseId: String, schoolId: String?) -> Unit,
    onUpdated: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ExpenseFormViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val saved by viewModel.saved.collectAsStateWithLifecycle()
    LaunchedEffect(saved) {
        val expense = saved ?: return@LaunchedEffect
        if (state.isEditing) onUpdated() else onCreated(expense.id, viewModel.schoolId)
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(if (state.isEditing) R.string.expenses_edit_expense else R.string.expenses_add_expense),
                subtitle = stringResource(R.string.expenses_form_subtitle),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        val contentModifier = Modifier.padding(padding)
        when {
            state.isLoading -> LoadingState(contentModifier)
            state.loadError != null -> ErrorState(loadErrorMessage(state.loadError!!), contentModifier, onRetry = viewModel::load)
            else -> ExpenseFormContent(
                state = state,
                callbacks = ExpenseFormCallbacks(
                    onTitleChange = viewModel::onTitleChange,
                    onCategoryChange = viewModel::onCategoryChange,
                    onCreateCategory = viewModel::createCategory,
                    onVendorChange = viewModel::onVendorChange,
                    onCreateVendor = viewModel::createVendor,
                    onAmountChange = viewModel::onAmountChange,
                    onBillDateChange = viewModel::onBillDateChange,
                    onDueDateChange = viewModel::onDueDateChange,
                    onBillPicked = viewModel::onBillPicked,
                    onRemoveBill = viewModel::onRemoveBill,
                    onRecurringChange = viewModel::onRecurringChange,
                    onUntilChange = viewModel::onUntilChange,
                    onNotesChange = viewModel::onNotesChange,
                    onSave = viewModel::save,
                ),
                modifier = contentModifier,
            )
        }
    }
}

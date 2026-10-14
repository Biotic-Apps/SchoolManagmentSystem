package com.schoolapp.feature.accounts.menu

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.model.accounts.Income
import com.schoolapp.core.model.accounts.IncomeCategory
import com.schoolapp.feature.accounts.R
import com.schoolapp.feature.accounts.categories.CategoryFormSheet
import com.schoolapp.feature.accounts.categories.IncomeCategoriesTab
import com.schoolapp.feature.accounts.categories.IncomeCategoriesViewModel
import com.schoolapp.feature.accounts.common.AccountsPermissions
import com.schoolapp.feature.accounts.common.SnackbarNotice
import com.schoolapp.feature.accounts.income.IncomeChange
import com.schoolapp.feature.accounts.income.IncomeListViewModel
import com.schoolapp.feature.accounts.income.form.IncomeFormViewModel
import com.schoolapp.feature.accounts.profitloss.ProfitLossActions
import com.schoolapp.feature.accounts.profitloss.ProfitLossTab
import com.schoolapp.feature.accounts.profitloss.ProfitLossViewModel

internal class AccountsTabViewModels(
    val income: IncomeListViewModel,
    val form: IncomeFormViewModel,
    val categories: IncomeCategoriesViewModel,
    val profitLoss: ProfitLossViewModel,
)

/** Body of the selected tab plus its sheets, dialogs and snackbars. */
@Composable
internal fun AccountsTabContent(
    tab: AccountsTab,
    branchId: String,
    permissions: AccountsPermissions,
    bottomSpace: PaddingValues,
    snackbar: SnackbarHostState,
    models: AccountsTabViewModels,
) {
    val categoriesState by models.categories.uiState.collectAsStateWithLifecycle()
    val categories = categoriesState.items
    when (tab) {
        AccountsTab.INCOME -> IncomeSection(branchId, permissions, bottomSpace, snackbar, models, categories)
        AccountsTab.CATEGORIES -> IncomeCategoriesTab(categoriesState, models.categories::refresh, bottomSpace)
        AccountsTab.PROFIT_LOSS -> {
            val state by models.profitLoss.uiState.collectAsStateWithLifecycle()
            ProfitLossTab(
                state = state,
                actions = ProfitLossActions(
                    onPreset = models.profitLoss::selectPreset,
                    onFrom = models.profitLoss::setFrom,
                    onTo = models.profitLoss::setTo,
                    onRefresh = models.profitLoss::refresh,
                    onRetry = models.profitLoss::retry,
                ),
            )
        }
    }
    categoriesState.form?.let { form ->
        CategoryFormSheet(
            form = form,
            onNameChange = models.categories::onNameChange,
            onCodeChange = models.categories::onCodeChange,
            onSave = models.categories::save,
            onDismiss = models.categories::closeForm,
        )
    }
    val added = categoriesState.added?.let { stringResource(R.string.accounts_category_added, it) }
    SnackbarNotice(added, snackbar, models.categories::consumeAdded)
}

/** Category label of an income row: the embedded name, else the school list (web `categoryName`). */
internal fun categoryNameOf(income: Income, categories: List<IncomeCategory>): String? =
    income.category?.name?.takeIf { it.isNotBlank() }
        ?: categories.firstOrNull { it.id == income.category?.id }?.name

@Composable
internal fun incomeChangeText(change: IncomeChange?): String? = when (change) {
    null -> null
    IncomeChange.RECORDED -> stringResource(R.string.accounts_income_recorded)
    IncomeChange.UPDATED -> stringResource(R.string.accounts_income_updated)
    IncomeChange.DELETED -> stringResource(R.string.accounts_income_deleted)
}

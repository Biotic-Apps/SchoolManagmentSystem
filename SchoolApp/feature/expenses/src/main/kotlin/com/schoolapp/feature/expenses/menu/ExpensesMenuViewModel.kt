package com.schoolapp.feature.expenses.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.feature.expenses.common.ExpenseBranchLoader
import com.schoolapp.feature.expenses.common.ExpensePermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class ExpensesTab { EXPENSES, VENDORS, CATEGORIES }

data class ExpensesMenuUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val permissions: ExpensePermissions = ExpensePermissions(),
    val tab: ExpensesTab = ExpensesTab.EXPENSES,
) {
    val selectedBranch: BranchOption? get() = branches.firstOrNull { it.id == selectedBranchId }

    /** Vendors and categories are school-wide; a global admin names the school through the branch. */
    val schoolId: String? get() = selectedBranch?.schoolId

    val noBranch: Boolean get() = !isLoading && error == null && selectedBranch == null
}

/** Branch scope, permissions and the selected tab of the Expenses & Vendors menu. */
@HiltViewModel
class ExpensesMenuViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val branchLoader: ExpenseBranchLoader,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ExpensesMenuUiState())
    val uiState: StateFlow<ExpensesMenuUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val permissions = ExpensePermissions.of(session)
            when (val result = branchLoader.load(session)) {
                is AppResult.Success -> _uiState.update { state ->
                    val branches = result.data.branches
                    val keep = state.selectedBranchId?.takeIf { id -> branches.any { it.id == id } }
                    val preferred = result.data.preferredId?.takeIf { id -> branches.any { it.id == id } }
                    state.copy(
                        isLoading = false,
                        branches = branches,
                        selectedBranchId = keep ?: preferred ?: branches.firstOrNull()?.id,
                        permissions = permissions,
                    )
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error, permissions = permissions) }
            }
        }
    }

    fun selectBranch(id: String) = _uiState.update { it.copy(selectedBranchId = id) }

    fun selectTab(tab: ExpensesTab) = _uiState.update { it.copy(tab = tab) }
}

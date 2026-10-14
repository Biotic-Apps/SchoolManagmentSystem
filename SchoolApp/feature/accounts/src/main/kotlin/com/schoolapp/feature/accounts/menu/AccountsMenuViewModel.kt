package com.schoolapp.feature.accounts.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.feature.accounts.common.AccountsBranchLoader
import com.schoolapp.feature.accounts.common.AccountsPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class AccountsTab { INCOME, CATEGORIES, PROFIT_LOSS }

data class AccountsMenuUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val permissions: AccountsPermissions = AccountsPermissions(),
    val tab: AccountsTab = AccountsTab.INCOME,
) {
    val selectedBranch: BranchOption? get() = branches.firstOrNull { it.id == selectedBranchId }
}

/** Branch scope, permissions and the selected tab of the Accounts menu. */
@HiltViewModel
class AccountsMenuViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val branchLoader: AccountsBranchLoader,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AccountsMenuUiState())
    val uiState: StateFlow<AccountsMenuUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val permissions = AccountsPermissions.of(session)
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

    fun selectTab(tab: AccountsTab) = _uiState.update { it.copy(tab = tab) }
}

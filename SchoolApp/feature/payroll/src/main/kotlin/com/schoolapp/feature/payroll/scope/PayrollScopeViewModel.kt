package com.schoolapp.feature.payroll.scope

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.fees.scope.FinanceBranch
import com.schoolapp.core.data.fees.scope.FinanceBranchScope
import com.schoolapp.core.model.SessionContext
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** [branch] is null until resolved (or when the school has no branch); [options] is non-empty only for global roles. */
@Immutable
data class PayrollScopeState(
    val ready: Boolean = false,
    val branch: FinanceBranch? = null,
    val options: List<FinanceBranch> = emptyList(),
    val session: SessionContext? = null,
    val error: AppError? = null,
)

/** Drives the branch bar above the payroll tabs; tabs are keyed by the branch id so they reload on a switch. */
@HiltViewModel
class PayrollScopeViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val scope: FinanceBranchScope,
) : ViewModel() {

    private val _state = MutableStateFlow(PayrollScopeState())
    val state: StateFlow<PayrollScopeState> = _state.asStateFlow()

    init {
        load()
    }

    fun retry() = load()

    fun select(branchId: String) {
        val current = _state.value
        if (branchId == current.branch?.id) return
        val session = current.session ?: return
        scope.select(session, branchId)
        _state.update { it.copy(branch = it.options.firstOrNull { option -> option.id == branchId } ?: it.branch) }
    }

    private fun load() {
        viewModelScope.launch {
            _state.update { it.copy(ready = false, error = null) }
            val session = authRepository.session.filterNotNull().first()
            when (val branch = scope.current(session)) {
                is AppResult.Success -> _state.update {
                    PayrollScopeState(ready = true, branch = branch.data, options = scope.options(session), session = session)
                }
                is AppResult.Failure -> _state.update { it.copy(ready = true, error = branch.error, session = session) }
            }
        }
    }
}

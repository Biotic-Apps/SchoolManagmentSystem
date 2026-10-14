package com.schoolapp.feature.payroll.setup.detail

import androidx.compose.runtime.Immutable
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.payroll.setup.PayrollSetupRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.payroll.setup.SalaryStructures
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.YearMonth
import javax.inject.Inject

@Immutable
data class SalaryDetailUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val structures: SalaryStructures? = null,
    val canEdit: Boolean = false,
    /** A principal looking at the principal's own pay, which only someone else may set. */
    val isOwn: Boolean = false,
    val form: SalaryForm? = null,
    val isSaving: Boolean = false,
    val saveError: AppError? = null,
    val saved: Boolean = false,
)

/** One staff member's salary: current structure, history, and the set / change form. */
@HiltViewModel
class SalaryDetailViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: PayrollSetupRepository,
    private val authRepository: AuthRepository,
    private val clock: AppClock,
) : ViewModel() {

    private val staffId: String = checkNotNull(savedStateHandle["staffId"])
    private val designation: String? = savedStateHandle["designation"]
    private val _uiState = MutableStateFlow(SalaryDetailUiState())
    val uiState: StateFlow<SalaryDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun retry() = load()

    fun startEdit() = _uiState.update { state ->
        if (!state.canEdit || state.isOwn) return@update state
        state.copy(form = SalaryForm.from(state.structures?.current, YearMonth.from(clock.now())), saveError = null, saved = false)
    }

    fun cancelEdit() = _uiState.update { it.copy(form = null, saveError = null) }

    fun edit(change: (SalaryForm) -> SalaryForm) = _uiState.update { state ->
        val form = state.form?.let(change) ?: return@update state
        state.copy(form = if (form.showIssues) form.copy(issues = form.validate()) else form)
    }

    fun save() {
        val form = _uiState.value.form ?: return
        if (_uiState.value.isSaving) return
        val issues = form.validate()
        if (!issues.isEmpty) {
            _uiState.update { it.copy(form = form.copy(issues = issues, showIssues = true)) }
            return
        }
        _uiState.update { it.copy(isSaving = true, saveError = null) }
        viewModelScope.launch {
            when (val result = repository.saveStructure(staffId, form.toInput())) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isSaving = false, form = null, structures = result.data, saved = true)
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error) }
            }
        }
    }

    private fun load() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val session = authRepository.session.first()
            val canEdit = session?.has(PAYROLL_EDIT) == true
            val isOwn = session?.activeRole == RoleKey.PRINCIPAL && designation.equals(RoleKey.PRINCIPAL.name, ignoreCase = true)
            val result = repository.structures(staffId)
            _uiState.update { state ->
                val base = state.copy(isLoading = false, canEdit = canEdit, isOwn = isOwn)
                when (result) {
                    is AppResult.Success -> base.copy(structures = result.data)
                    is AppResult.Failure -> base.copy(error = result.error)
                }
            }
        }
    }

    private companion object {
        const val PAYROLL_EDIT = "payroll.edit"
    }
}

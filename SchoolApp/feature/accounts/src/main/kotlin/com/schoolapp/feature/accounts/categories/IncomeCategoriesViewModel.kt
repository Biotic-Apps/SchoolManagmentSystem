package com.schoolapp.feature.accounts.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.accounts.AccountsRepository
import com.schoolapp.core.model.accounts.IncomeCategory
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Locale
import javax.inject.Inject

data class IncomeCategoriesUiState(
    val schoolKey: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val items: List<IncomeCategory> = emptyList(),
    val form: CategoryFormState? = null,
    val added: String? = null,
)

/** Income categories shared by every branch of the school, plus "Add category" (`expenses.add`). */
@HiltViewModel
class IncomeCategoriesViewModel @Inject constructor(
    private val repository: AccountsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(IncomeCategoriesUiState())
    val uiState: StateFlow<IncomeCategoriesUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    fun setSchool(schoolId: String?) {
        val key = schoolId ?: OWN_SCHOOL
        if (_uiState.value.schoolKey == key) return
        this.schoolId = schoolId
        _uiState.update { IncomeCategoriesUiState(schoolKey = key) }
        refresh()
    }

    fun refresh() {
        if (_uiState.value.schoolKey == null) return
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = it.items.isEmpty(), isRefreshing = it.items.isNotEmpty(), error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.incomeCategories(schoolId)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(isLoading = false, isRefreshing = false, items = result.data)
                    is AppResult.Failure -> state.copy(isLoading = false, isRefreshing = false, error = result.error)
                }
            }
        }
    }

    fun openForm() = _uiState.update { it.copy(form = CategoryFormState()) }

    fun closeForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun onNameChange(text: String) = updateForm { it.copy(name = text, nameError = null) }

    fun onCodeChange(text: String) = updateForm { it.copy(code = text.uppercase(Locale.ENGLISH), codeError = null) }

    fun consumeAdded() = _uiState.update { it.copy(added = null) }

    fun save() {
        val form = _uiState.value.form ?: return
        if (form.isSaving) return
        val checked = form.validated()
        if (checked.hasErrors) {
            _uiState.update { it.copy(form = checked) }
            return
        }
        _uiState.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.createIncomeCategory(schoolId, form.name.trim(), form.code.trim().ifEmpty { null })) {
                is AppResult.Success -> _uiState.update { state ->
                    val items = (state.items + result.data).distinctBy { it.id }.sortedBy { it.name.lowercase() }
                    state.copy(form = null, added = result.data.name, items = items)
                }
                is AppResult.Failure -> _uiState.update { state ->
                    state.copy(form = state.form?.copy(isSaving = false, error = result.error))
                }
            }
        }
    }

    private fun updateForm(transform: (CategoryFormState) -> CategoryFormState) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it).copy(error = null)) } ?: state }

    private companion object {
        const val OWN_SCHOOL = "own"
    }
}

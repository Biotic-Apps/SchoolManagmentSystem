package com.schoolapp.feature.expenses.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.expenses.ExpensesRepository
import com.schoolapp.core.model.expenses.ExpenseCategory
import com.schoolapp.core.model.expenses.ExpenseCategoryInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.Locale
import javax.inject.Inject

enum class CategoryError { NAME_REQUIRED, NAME_SHORT, NAME_LONG, CODE_INVALID }

data class CategoryFormState(
    val name: String = "",
    val code: String = "",
    val nameError: CategoryError? = null,
    val codeError: CategoryError? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

data class CategoriesUiState(
    val schoolKey: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val error: AppError? = null,
    val items: List<ExpenseCategory> = emptyList(),
    val form: CategoryFormState? = null,
    val added: String? = null,
)

/** Expense categories shared by every branch of the school, plus "Add category". */
@HiltViewModel
class CategoriesViewModel @Inject constructor(
    private val repository: ExpensesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CategoriesUiState())
    val uiState: StateFlow<CategoriesUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    fun setSchool(schoolId: String?) {
        val key = schoolId ?: OWN_SCHOOL
        if (_uiState.value.schoolKey == key) return
        this.schoolId = schoolId
        _uiState.update { CategoriesUiState(schoolKey = key) }
        refresh()
    }

    fun refresh() {
        if (_uiState.value.schoolKey == null) return
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = it.items.isEmpty(), isRefreshing = it.items.isNotEmpty(), error = null) }
        loadJob = viewModelScope.launch {
            val result = repository.categories(schoolId)
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
        val name = form.name.trim()
        val code = form.code.trim()
        val nameError = when {
            name.isEmpty() -> CategoryError.NAME_REQUIRED
            name.length < MIN_NAME -> CategoryError.NAME_SHORT
            name.length > MAX_NAME -> CategoryError.NAME_LONG
            else -> null
        }
        val codeError = if (code.isNotEmpty() && !CodePattern.matches(code)) CategoryError.CODE_INVALID else null
        if (nameError != null || codeError != null) {
            _uiState.update { it.copy(form = form.copy(nameError = nameError, codeError = codeError)) }
            return
        }
        _uiState.update { it.copy(form = form.copy(isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.createCategory(schoolId, ExpenseCategoryInput(name, code.ifEmpty { null }))) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(form = null, added = result.data.name) }
                    refresh()
                }
                is AppResult.Failure -> _uiState.update { state ->
                    state.copy(form = state.form?.copy(isSaving = false, error = result.error))
                }
            }
        }
    }

    private fun updateForm(transform: (CategoryFormState) -> CategoryFormState) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it).copy(error = null)) } ?: state }

    companion object {
        const val MIN_NAME = 2
        const val MAX_NAME = 80
        private const val OWN_SCHOOL = "own"

        /** Server rule: upper snake case, starts with a letter, 2–30 characters. */
        private val CodePattern = Regex("^[A-Z][A-Z0-9_]{1,29}$")
    }
}

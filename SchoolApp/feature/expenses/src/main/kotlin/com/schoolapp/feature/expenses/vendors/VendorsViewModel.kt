package com.schoolapp.feature.expenses.vendors

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.expenses.ExpensesRepository
import com.schoolapp.core.model.expenses.Vendor
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class VendorsUiState(
    val schoolKey: String? = null,
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val isLoadingMore: Boolean = false,
    val error: AppError? = null,
    val loadMoreError: AppError? = null,
    val search: String = "",
    val items: List<Vendor> = emptyList(),
    val total: Int = 0,
    val page: Int = 0,
    val hasMore: Boolean = false,
    /** Non-null while the "Add vendor" sheet is open. */
    val form: VendorFormState? = null,
    /** Name of the vendor just added, for the snackbar. */
    val added: String? = null,
)

/** School-wide vendor list with search, paging and "Add vendor". */
@HiltViewModel
class VendorsViewModel @Inject constructor(
    private val repository: ExpensesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(VendorsUiState())
    val uiState: StateFlow<VendorsUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var loadJob: Job? = null

    fun setSchool(schoolId: String?) {
        val key = schoolId ?: OWN_SCHOOL
        if (_uiState.value.schoolKey == key) return
        this.schoolId = schoolId
        _uiState.update { VendorsUiState(schoolKey = key) }
        load(reset = true)
    }

    fun refresh() = load(reset = true)

    fun onSearchChange(text: String) {
        _uiState.update { it.copy(search = text) }
        load(reset = true, debounce = true)
    }

    fun loadMore() {
        val state = _uiState.value
        if (!state.hasMore || state.isLoadingMore || state.isLoading || state.loadMoreError != null) return
        load(reset = false)
    }

    fun retryMore() {
        _uiState.update { it.copy(loadMoreError = null) }
        loadMore()
    }

    fun openForm() = _uiState.update { it.copy(form = VendorFormState()) }

    fun closeForm() = _uiState.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun updateForm(transform: (VendorFormState) -> VendorFormState) =
        _uiState.update { state -> state.form?.let { state.copy(form = transform(it).copy(error = null)) } ?: state }

    fun consumeAdded() = _uiState.update { it.copy(added = null) }

    fun save() {
        val form = _uiState.value.form ?: return
        if (form.isSaving) return
        val errors = form.validate()
        if (errors.isNotEmpty()) {
            _uiState.update { it.copy(form = form.copy(errors = errors)) }
            return
        }
        _uiState.update { it.copy(form = form.copy(errors = emptyMap(), isSaving = true, error = null)) }
        viewModelScope.launch {
            when (val result = repository.createVendor(schoolId, form.toInput())) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(form = null, added = result.data.name) }
                    load(reset = true)
                }
                is AppResult.Failure -> _uiState.update { state ->
                    state.copy(form = state.form?.copy(isSaving = false, error = result.error))
                }
            }
        }
    }

    private fun load(reset: Boolean, debounce: Boolean = false) {
        val state = _uiState.value
        if (state.schoolKey == null) return
        if (reset) loadJob?.cancel()
        val page = if (reset) 1 else state.page + 1
        _uiState.update {
            if (reset) {
                it.copy(isLoading = it.items.isEmpty(), isRefreshing = it.items.isNotEmpty() && !debounce, isLoadingMore = false, error = null, loadMoreError = null)
            } else {
                it.copy(isLoadingMore = true, loadMoreError = null)
            }
        }
        loadJob = viewModelScope.launch {
            if (debounce) delay(SEARCH_DEBOUNCE_MS)
            val result = repository.vendors(schoolId, _uiState.value.search, page, PAGE_SIZE)
            _uiState.update { current ->
                when (result) {
                    is AppResult.Success -> current.copy(
                        isLoading = false,
                        isRefreshing = false,
                        isLoadingMore = false,
                        items = if (reset) result.data.items else (current.items + result.data.items).distinctBy { it.id },
                        total = result.data.total,
                        page = page,
                        hasMore = result.data.hasMore,
                    )
                    is AppResult.Failure -> if (reset) {
                        current.copy(isLoading = false, isRefreshing = false, error = result.error)
                    } else {
                        current.copy(isLoadingMore = false, loadMoreError = result.error)
                    }
                }
            }
        }
    }

    private companion object {
        const val PAGE_SIZE = 30
        const val SEARCH_DEBOUNCE_MS = 350L
        const val OWN_SCHOOL = "own"
    }
}

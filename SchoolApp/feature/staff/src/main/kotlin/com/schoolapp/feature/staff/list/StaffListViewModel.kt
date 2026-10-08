package com.schoolapp.feature.staff.list

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.feature.staff.common.StaffEvents
import com.schoolapp.feature.staff.common.StaffPermissions
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@Immutable
data class StaffListUiState(
    val isLoading: Boolean = true,
    val query: String = "",
    val staff: List<StaffSummary> = emptyList(),
    val error: AppError? = null,
    /** `staff.add` on the active role (principal, super admin), same check as the web "Add staff" button. */
    val canAdd: Boolean = false,
)

@OptIn(FlowPreview::class)
@HiltViewModel
class StaffListViewModel @Inject constructor(
    private val repository: StaffRepository,
    private val authRepository: AuthRepository,
    private val events: StaffEvents,
) : ViewModel() {

    private val _uiState = MutableStateFlow(StaffListUiState())
    val uiState: StateFlow<StaffListUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.map(StaffPermissions::canAdd).distinctUntilChanged().collect { canAdd ->
                _uiState.update { it.copy(canAdd = canAdd) }
            }
        }
        viewModelScope.launch { events.changes.drop(1).collect { search(_uiState.value.query.trim(), quiet = true) } }
        viewModelScope.launch {
            _uiState.map { it.query.trim() }.distinctUntilChanged().debounce(SEARCH_DEBOUNCE_MS).collectLatest(::search)
        }
    }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun retry() {
        viewModelScope.launch { search(_uiState.value.query.trim()) }
    }

    private suspend fun search(query: String, quiet: Boolean = false) {
        if (!quiet) _uiState.update { it.copy(isLoading = true, error = null) }
        when (val result = repository.staff(query)) {
            is AppResult.Success -> _uiState.update { it.copy(isLoading = false, staff = result.data) }
            is AppResult.Failure -> if (!quiet) _uiState.update { it.copy(isLoading = false, error = result.error) }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
    }
}

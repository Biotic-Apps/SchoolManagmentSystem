package com.schoolapp.feature.students.guardians

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.people.GuardiansRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.async
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

/** Principal's "Parents & Guardians": pending child-link requests and the guardian directory (read-only). */
@OptIn(FlowPreview::class)
@HiltViewModel
class GuardiansViewModel @Inject constructor(
    private val repository: GuardiansRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(GuardiansUiState())
    val uiState: StateFlow<GuardiansUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            _uiState.map { it.query.trim() }.distinctUntilChanged().drop(1).debounce(SEARCH_DEBOUNCE_MS).collectLatest { query ->
                when (val result = repository.guardians(query)) {
                    is AppResult.Success -> _uiState.update { it.copy(guardians = result.data) }
                    is AppResult.Failure -> _uiState.update { it.copy(error = result.error) }
                }
            }
        }
    }

    fun onTabSelected(tab: GuardiansTab) = _uiState.update { it.copy(tab = tab) }

    fun onQueryChange(query: String) = _uiState.update { it.copy(query = query) }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            val requests = async { repository.pendingChildLinks() }
            val guardians = async { repository.guardians(_uiState.value.query) }
            val requestResult = requests.await()
            val guardianResult = guardians.await()
            val error = (requestResult as? AppResult.Failure)?.error ?: (guardianResult as? AppResult.Failure)?.error
            _uiState.update {
                it.copy(
                    isLoading = false,
                    error = error,
                    requests = (requestResult as? AppResult.Success)?.data.orEmpty(),
                    guardians = (guardianResult as? AppResult.Success)?.data.orEmpty(),
                )
            }
        }
    }

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 350L
    }
}

package com.schoolapp.feature.students.sections

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.data.people.StudentsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Sections in scope (teacher: own; supervisors: branch) plus, for branch-wide roles, a student search. */
@OptIn(FlowPreview::class)
@HiltViewModel
class MyClassesViewModel @Inject constructor(
    private val scopedSections: ScopedSections,
    private val studentsRepository: StudentsRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(MyClassesUiState())
    val uiState: StateFlow<MyClassesUiState> = _uiState.asStateFlow()

    init {
        load()
        viewModelScope.launch {
            val canSearch = authRepository.session.filterNotNull().first().canSearchStudents()
            _uiState.update { it.copy(canSearch = canSearch) }
            if (!canSearch) return@launch
            _uiState.map { it.searchTerm() }
                .distinctUntilChanged()
                .debounce(SEARCH_DEBOUNCE_MS)
                .collectLatest(::search)
        }
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            when (val result = scopedSections.load()) {
                is AppResult.Success -> _uiState.update {
                    it.copy(isLoading = false, sections = result.data.sortedWith(compareBy({ s -> s.className }, { s -> s.name })))
                }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, error = result.error) }
            }
        }
    }

    fun onQueryChange(query: String) = _uiState.update { state ->
        val next = state.copy(query = query)
        // Searching state shows immediately so stale results never flash while the debounce runs.
        if (next.searchTerm() != state.searchTerm() && next.searchTerm().isNotEmpty()) next.copy(isSearching = true) else next
    }

    private suspend fun search(term: String) {
        if (term.isEmpty()) {
            _uiState.update { it.copy(isSearching = false, results = emptyList(), searchError = null) }
            return
        }
        _uiState.update { it.copy(isSearching = true, searchError = null) }
        when (val result = studentsRepository.students(search = term)) {
            is AppResult.Success -> _uiState.update { it.copy(isSearching = false, results = result.data.sortedBy { s -> s.name }) }
            is AppResult.Failure -> _uiState.update { it.copy(isSearching = false, searchError = result.error) }
        }
    }

    /** Trimmed query once it reaches the minimum length, else empty (no search). */
    private fun MyClassesUiState.searchTerm(): String =
        query.trim().takeIf { it.length >= MyClassesUiState.MIN_SEARCH_LENGTH }.orEmpty()

    private companion object {
        const val SEARCH_DEBOUNCE_MS = 300L
    }
}
